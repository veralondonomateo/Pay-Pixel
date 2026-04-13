// Meta Cloud API — WhatsApp Business
// Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api

const API_VERSION = "v19.0";

interface WhatsAppTextMessage {
  phoneId: string;
  accessToken: string;
  to: string;       // número en formato E.164 sin +, ej: 573001234567
  body: string;
}

export async function sendWhatsAppText(opts: WhatsAppTextMessage): Promise<void> {
  const to = opts.to.replace(/\D/g, "");
  const normalized = to.startsWith("57") ? to : `57${to}`;

  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${opts.phoneId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalized,
        type: "text",
        text: { body: opts.body, preview_url: true },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp API error: ${res.status} — ${text}`);
  }
}

// ── Mensajes de recuperación de carrito ───────────────────────────────────────

export function buildRecoveryMessage(
  step: number,
  opts: {
    firstName: string;
    productName: string;
    recoveryUrl: string;
    brandName: string;
    discountPercent?: number;
  }
): string {
  const { firstName, productName, recoveryUrl, brandName, discountPercent } = opts;

  switch (step) {
    case 1: // 30 min
      return (
        `¡Hola ${firstName}! 👋\n\n` +
        `Dejaste tu pedido de *${productName}* sin terminar en ${brandName}.\n\n` +
        `Te guardamos tu carrito — retoma tu compra aquí:\n${recoveryUrl}\n\n` +
        `¿Tienes alguna pregunta? Escríbenos y te ayudamos. 😊`
      );

    case 4: // 72 h — último intento
      const discountMsg = discountPercent
        ? `\n\n🎁 *Oferta exclusiva:* Usa el código *RECUPERA${discountPercent}* al pagar y obtén ${discountPercent}% de descuento.`
        : "";
      return (
        `${firstName}, ¡último aviso! ⚠️\n\n` +
        `Tu pedido de *${productName}* está casi agotado. Nos quedan muy pocas unidades.\n\n` +
        `Completa tu compra antes de que se acabe:${discountMsg}\n${recoveryUrl}`
      );

    default:
      return (
        `Hola ${firstName}, recuerda que tienes un pedido pendiente en ${brandName}.\n\n` +
        `Retómalo aquí: ${recoveryUrl}`
      );
  }
}
