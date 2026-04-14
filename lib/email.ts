import { Resend } from "resend";

export interface RecoveryEmailOpts {
  to: string;
  firstName: string;
  brandName: string;
  brandLogo?: string | null;
  primaryColor: string;
  productName: string;
  productImage?: string | null;
  total: number;
  recoveryUrl: string;
  subject: string;
  discountCode?: string;
  discountPercent?: number;
}

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

export async function sendRecoveryEmail(opts: RecoveryEmailOpts): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const {
    to, firstName, brandName, brandLogo, primaryColor, productName,
    productImage, total, recoveryUrl, subject, discountCode, discountPercent,
  } = opts;

  const discountSection = discountCode
    ? `
      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
        <p style="margin:0;font-size:14px;color:#856404;">🎁 Código de descuento exclusivo para ti</p>
        <p style="margin:8px 0 0;font-size:22px;font-weight:700;letter-spacing:2px;color:#333;">${discountCode}</p>
        ${discountPercent ? `<p style="margin:4px 0 0;font-size:13px;color:#856404;">${discountPercent}% de descuento en tu compra</p>` : ""}
      </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

    <!-- Header -->
    <div style="background:${primaryColor};padding:24px;text-align:center;">
      ${brandLogo
        ? `<img src="${brandLogo}" alt="${brandName}" style="height:40px;object-fit:contain;">`
        : `<h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${brandName}</h1>`
      }
    </div>

    <!-- Body -->
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 8px;font-size:20px;color:#111;">¡Hola, ${firstName}!</h2>
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.5;">
        Notamos que dejaste tu carrito sin completar. Tu pedido de <strong>${productName}</strong> sigue esperándote.
      </p>

      ${productImage
        ? `<div style="text-align:center;margin:20px 0;">
            <img src="${productImage}" alt="${productName}" style="max-width:200px;border-radius:8px;border:1px solid #eee;">
           </div>`
        : ""
      }

      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
        <p style="margin:0;font-size:14px;color:#888;">Total de tu pedido</p>
        <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#111;">${formatCOP(total)}</p>
      </div>

      ${discountSection}

      <div style="text-align:center;margin:28px 0;">
        <a href="${recoveryUrl}"
           style="background:${primaryColor};color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">
          Completar mi compra →
        </a>
      </div>

      <p style="margin:0;font-size:13px;color:#aaa;text-align:center;line-height:1.5;">
        Si ya realizaste tu compra, ignora este mensaje.<br>
        Este enlace es válido por 72 horas.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#aaa;">
        © ${new Date().getFullYear()} ${brandName} · Powered by PayPixel
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: `${brandName} <noreply@paypixel.com>`,
    to,
    subject,
    html,
  });
}

export async function sendOrderConfirmationEmail(opts: {
  to: string;
  firstName: string;
  brandName: string;
  primaryColor: string;
  orderId: string;
  total: number;
  items: Array<{ name: string; variant?: string | null; quantity: number; price: number }>;
  paymentMethod: "mercadopago" | "contraentrega";
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { to, firstName, brandName, primaryColor, orderId, total, items, paymentMethod } = opts;

  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#333;">
          ${i.name}${i.variant ? ` – ${i.variant}` : ""} × ${i.quantity}
        </td>
        <td style="padding:8px 0;font-size:14px;color:#333;text-align:right;font-weight:600;">
          ${formatCOP(i.price * i.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:${primaryColor};padding:24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:20px;">¡Pedido confirmado!</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="font-size:15px;color:#555;">Hola <strong>${firstName}</strong>, tu pedido fue recibido exitosamente.</p>
      <p style="font-size:13px;color:#aaa;">Ref. #${orderId.split("-")[0].toUpperCase()}</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #eee;">
        ${itemRows}
        <tr style="border-top:1px solid #eee;">
          <td style="padding:12px 0;font-size:15px;font-weight:700;color:#111;">Total</td>
          <td style="padding:12px 0;font-size:18px;font-weight:700;color:#111;text-align:right;">${formatCOP(total)}</td>
        </tr>
      </table>

      ${paymentMethod === "contraentrega"
        ? `<div style="background:#fff3e0;border-radius:8px;padding:14px;font-size:14px;color:#e65100;">
            💵 <strong>Pago contra entrega:</strong> Ten el efectivo listo cuando llegue tu pedido.
           </div>`
        : `<div style="background:#e8f5e9;border-radius:8px;padding:14px;font-size:14px;color:#2e7d32;">
            ✅ <strong>Pago con MercadoPago:</strong> Tu pago fue procesado exitosamente.
           </div>`
      }
    </div>
    <div style="background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#aaa;">© ${new Date().getFullYear()} ${brandName}</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: `${brandName} <noreply@paypixel.com>`,
    to,
    subject: `¡Pedido recibido! – ${brandName}`,
    html,
  });
}
