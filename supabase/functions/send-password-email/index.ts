import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client with Service Role to access users table
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch user details
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('name, email, password')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 16px 16px 0 0; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
            Recuperación de Contraseña
          </h1>
        </div>
        <div style="background: #ffffff; padding: 28px 24px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <p style="color: #1a1a2e; font-size: 16px;">Hola <strong>${user.name || 'Cliente'}</strong>,</p>
          <p style="color: #1a1a2e; font-size: 14px; margin-bottom: 24px;">Hemos recibido una solicitud para recuperar la contraseña de tu cuenta en Azote Store.</p>
          
          <div style="background: #f8f9ff; border-radius: 12px; padding: 16px 20px; border-left: 4px solid #3b5bdb; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Tu contraseña es:</p>
            <p style="margin: 0; font-size: 20px; color: #1a1a2e; font-weight: bold; letter-spacing: 1px;">${user.password}</p>
          </div>
          
          <p style="color: #6c757d; font-size: 13px; margin-top: 24px;">Por motivos de seguridad, te recomendamos iniciar sesión y, si es posible, eliminar este correo.</p>
        </div>
        <div style="text-align: center; padding: 20px 0 0;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            Este correo fue enviado automáticamente por <strong>Azote Store</strong>
          </p>
        </div>
      </div>
    </body>
    </html>`;

    // Try to send via Resend
    // Note: Free Resend accounts can only send to verified domains.
    // So if the user's email is not verified in Resend, it might throw an error.
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Azote Store <onboarding@resend.dev>",
        to: [email],
        subject: "Recuperación de Contraseña - Azote Store",
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Password email sent successfully:", resendData);
    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
