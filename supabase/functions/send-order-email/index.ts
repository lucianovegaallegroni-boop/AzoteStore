import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from 'npm:nodemailer@6';

const GMAIL_USER = "lucianovegaallegroni@gmail.com";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD") || "fqkk simh nqbt kfqg";
const ADMIN_EMAIL = "cristhianv1018@gmail.com";

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

interface OrderRecord {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string | null;
  total: number;
  pickup_location: string | null;
  payment_proof_name: string | null;
  payment_proof_preview: string | null;
  status: string;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: OrderRecord;
  schema: string;
  old_record: OrderRecord | null;
}

Deno.serve(async (req: Request) => {
  try {
    const payload: WebhookPayload = await req.json();
    const order = payload.record;

    // Only send email on new order inserts
    if (payload.type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Not an INSERT, skipping." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const orderDate = new Date(order.created_at || Date.now()).toLocaleString("es-PA", {
      timeZone: "America/Panama",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Fetch order items from Supabase to include in email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let itemsHtml = "";
    try {
      const itemsRes = await fetch(
        `${supabaseUrl}/rest/v1/order_items?order_id=eq.${order.id}&select=product_name,color_name,quantity,price`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      );
      const items = await itemsRes.json();

      if (Array.isArray(items) && items.length > 0) {
        const itemRows = items
          .map(
            (item: { product_name: string; color_name: string | null; quantity: number; price: number }) => `
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1a1a2e;">
                ${item.product_name}${item.color_name ? ` <span style="color: #6c757d;">(${item.color_name})</span>` : ""}
              </td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 14px; color: #1a1a2e;">
                ${item.quantity}
              </td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a2e;">
                $${(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>`
          )
          .join("");

        itemsHtml = `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 8px; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9ff;">
                <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; border-bottom: 2px solid #e8e8f0;">Producto</th>
                <th style="padding: 10px 16px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; border-bottom: 2px solid #e8e8f0;">Cant.</th>
                <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; border-bottom: 2px solid #e8e8f0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>`;
      }
    } catch (e) {
      console.error("Error fetching order items:", e);
      itemsHtml = `<p style="color: #6c757d; font-size: 13px;">No se pudieron cargar los artículos del pedido.</p>`;
    }

    // Upload payment proof to Supabase Storage to get a public URL (Gmail blocks base64 images)
    let proofImageUrl = "";
    if (order.payment_proof_preview && order.payment_proof_preview.startsWith("data:")) {
      try {
        // Extract mime type and base64 content from data URL
        const matches = order.payment_proof_preview.match(/^data:(.+?);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const extension = mimeType.split("/")[1] || "png";
          const fileName = `${order.id}-comprobante.${extension}`;

          // Decode base64 to binary
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Upload to Supabase Storage
          const uploadRes = await fetch(
            `${supabaseUrl}/storage/v1/object/payment-proofs/${fileName}`,
            {
              method: "POST",
              headers: {
                apikey: supabaseServiceKey,
                Authorization: `Bearer ${supabaseServiceKey}`,
                "Content-Type": mimeType,
                "x-upsert": "true",
              },
              body: bytes,
            }
          );

          if (uploadRes.ok) {
            proofImageUrl = `${supabaseUrl}/storage/v1/object/public/payment-proofs/${fileName}`;
            console.log("Payment proof uploaded:", proofImageUrl);
          } else {
            console.error("Storage upload failed:", await uploadRes.text());
          }
        }
      } catch (e) {
        console.error("Error uploading payment proof:", e);
      }
    }

    // Build the email HTML
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 16px 16px 0 0; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
            🛒 Nuevo Pedido Recibido
          </h1>
          <p style="margin: 8px 0 0; color: #a8b4d4; font-size: 13px;">
            ${orderDate}
          </p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 28px 24px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Order ID Badge -->
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; background: #eef0ff; color: #3b5bdb; font-size: 13px; font-weight: 700; padding: 8px 20px; border-radius: 50px; letter-spacing: 0.5px;">
              Pedido ${order.id}
            </span>
          </div>

          <!-- Client Info -->
          <div style="background: #f8f9ff; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; border-left: 4px solid #3b5bdb;">
            <h3 style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d;">Información del Cliente</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #1a1a2e;"><strong>Nombre:</strong> ${order.client_name}</p>
            ${order.client_phone ? `<p style="margin: 4px 0; font-size: 14px; color: #1a1a2e;"><strong>Teléfono / WhatsApp:</strong> ${order.client_phone}</p>` : ""}
            ${order.client_email && order.client_email !== 'N/A' && !order.client_email.includes('invitado') ? `<p style="margin: 4px 0; font-size: 14px; color: #1a1a2e;"><strong>Email:</strong> ${order.client_email}</p>` : ""}
            ${order.pickup_location ? `<p style="margin: 4px 0; font-size: 14px; color: #1a1a2e;"><strong>Retiro:</strong> ${order.pickup_location}</p>` : ""}
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d;">Artículos del Pedido</h3>
            ${itemsHtml}
          </div>

          <!-- Total -->
          <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); border-radius: 12px; padding: 20px 24px; text-align: center;">
            <p style="margin: 0; color: #a8b4d4; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Total del Pedido</p>
            <p style="margin: 6px 0 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -1px;">
              $${order.total.toFixed(2)}
            </p>
          </div>

          <!-- Payment Proof Image -->
          ${proofImageUrl ? `
          <div style="margin-top: 20px;">
            <h3 style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d;">Comprobante de Pago</h3>
            <div style="background: #f0fff4; border-radius: 12px; border: 1px solid #c6f6d5; padding: 16px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 13px; color: #276749;">
                ✅ <strong>${order.payment_proof_name || 'Comprobante'}</strong>
              </p>
              <img src="${proofImageUrl}" alt="Comprobante de pago" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.08);" />
            </div>
          </div>` : order.payment_proof_name ? `
          <div style="margin-top: 16px; padding: 12px 16px; background: #f0fff4; border-radius: 8px; border: 1px solid #c6f6d5;">
            <p style="margin: 0; font-size: 13px; color: #276749;">
              ✅ <strong>Comprobante adjunto:</strong> ${order.payment_proof_name}
            </p>
          </div>` : ""}

          <!-- Status -->
          <div style="margin-top: 16px; padding: 12px 16px; background: #fff8e1; border-radius: 8px; border: 1px solid #ffe082;">
            <p style="margin: 0; font-size: 13px; color: #f57f17;">
              ⏳ <strong>Estado:</strong> ${order.status} — Pendiente de verificación
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e8e8f0; text-align: center;">
            <p style="margin: 0 0 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d;">Acciones de Administrador</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <a href="${supabaseUrl}/functions/v1/process-order-action?order_id=${order.id}&action=confirm"
                 target="_blank"
                 style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(16,185,129,0.25);">
                ✅ Confirmar Pedido
              </a>
              <a href="${supabaseUrl}/functions/v1/process-order-action?order_id=${order.id}&action=reject"
                 target="_blank"
                 style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(239,68,68,0.25);">
                ❌ Rechazar Pedido (Devolver Stock)
              </a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px 0 0;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            Este correo fue enviado automáticamente por <strong>Azote Store</strong>
          </p>
        </div>
      </div>
    </body>
    </html>`;

    // Send via Gmail SMTP
    const info = await transporter.sendMail({
      from: `"Azote Store" <${GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🛒 Nuevo Pedido: ${order.id} — $${order.total.toFixed(2)} de ${order.client_name}`,
      html: emailHtml,
    });

    console.log("Email sent successfully via Gmail:", info.messageId);
    return new Response(JSON.stringify({ message: "Email sent", messageId: info.messageId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
