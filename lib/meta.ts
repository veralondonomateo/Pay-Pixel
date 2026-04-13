import { createHash } from "crypto";

const API_VERSION = "v19.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function hashPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("57") ? digits : `57${digits}`;
  return createHash("sha256").update(normalized).digest("hex");
}

export interface MetaEventInput {
  pixelId: string;
  accessToken: string;
  eventName: string;
  orderId: string;
  email: string;
  phone?: string;
  value?: number;
  currency?: string;
  eventSourceUrl?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
}

export async function sendMetaEvent(input: MetaEventInput): Promise<void> {
  if (!input.pixelId || !input.accessToken) {
    console.warn("[Meta CAPI] Missing pixel_id or access_token — skipping");
    return;
  }

  const userData: Record<string, unknown> = {
    em: [sha256(input.email)],
  };
  if (input.phone) userData.ph = [hashPhone(input.phone)];
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url:
          input.eventSourceUrl ?? "https://paypixel.com/checkout",
        event_id: `${input.eventName.toLowerCase()}_${input.orderId}`,
        user_data: userData,
        ...(input.value !== undefined
          ? {
              custom_data: {
                currency: input.currency ?? "COP",
                value: input.value,
                order_id: input.orderId,
              },
            }
          : {}),
      },
    ],
    access_token: input.accessToken,
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${input.pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(`[Meta CAPI] Error (${input.eventName}):`, text);
    } else {
      console.log(`[Meta CAPI] ${input.eventName} sent for order ${input.orderId}`);
    }
  } catch (err) {
    console.error("[Meta CAPI] Fetch error:", err);
  }
}

export async function sendPurchaseEvent(
  input: Omit<MetaEventInput, "eventName">
): Promise<void> {
  return sendMetaEvent({ ...input, eventName: "Purchase" });
}

export async function sendInitiateCheckoutEvent(
  input: Omit<MetaEventInput, "eventName" | "value">
): Promise<void> {
  return sendMetaEvent({ ...input, eventName: "InitiateCheckout" });
}
