import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const action = url.searchParams.get("action"); // 'confirm' | 'reject'

  if (!orderId || !action) {
    return new Response("Parámetros incompletos (order_id y action son requeridos).", {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let message = "";
  let isSuccess = false;

  try {
    const { data, error } = await supabase.rpc("process_order_action", {
      p_order_id: orderId,
      p_action: action,
    });

    if (error) {
      message = "Error en el servidor: " + error.message;
    } else if (data) {
      isSuccess = data.success;
      message = data.message;
    }
  } catch (err: any) {
    message = "Error: " + err.message;
  }

  const isConfirm = action === "confirm";
  const icon = isConfirm ? "✅" : "❌";
  const title = isConfirm ? "Pedido Confirmado" : "Pedido Rechazado";
  const bgColor = isConfirm ? "#10b981" : "#ef4444";

  const responseHtml = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Azote Store</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      .card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 20px;
        padding: 40px 32px;
        max-width: 480px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      }
      .icon-box {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: ${bgColor}22;
        border: 2px solid ${bgColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        margin: 0 auto 24px;
      }
      h1 {
        font-size: 24px;
        margin: 0 0 12px;
        color: #ffffff;
      }
      p {
        font-size: 15px;
        color: #94a3b8;
        line-height: 1.6;
        margin: 0 0 28px;
      }
      .badge {
        display: inline-block;
        background: #334155;
        color: #38bdf8;
        font-weight: bold;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-family: monospace;
      }
      .btn {
        display: inline-block;
        background-color: #2563eb;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 14px;
        transition: background 0.2s;
      }
      .btn:hover {
        background-color: #1d4ed8;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon-box">${icon}</div>
      <h1>${title}</h1>
      <p><span class="badge">${orderId}</span></p>
      <p>${message}</p>
      <a href="/" class="btn">Volver al Inicio</a>
    </div>
  </body>
  </html>`;

  return new Response(responseHtml, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
