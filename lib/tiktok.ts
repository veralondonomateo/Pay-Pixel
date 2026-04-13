import { createHash } from "crypto";

const API_VERSION = "v1.3";
const TIKTOK_EVENTS_URL = `https://business-api.tiktok.com/open_api/${API_VERSION}/pixel/track/`;

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function hashPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("57") ? digits : `57${digits}`;
  return createHash("sha256").update(normalized).digest("hex");
}

export interface TikTokEventInput {
  pixelId: string;
  accessToken: string;
  eventName: string;   // "CompletePayment" | "InitiateCheckout" | "ViewContent"
  orderId: string;
  email: string;
  phone?: string;
  value?: number;
  currency?: string;
  clientIp?: string;
  clientUserAgent?: string;
  ttp?: string;        // _ttp cookie
  ttclid?: string;
}

export async function sendTikTokEvent(input: TikTokEventInput): Promise<void> {
  if (!input.pixelId || !input.accessToken) {
    console.warn("[TikTok Events] Missing pixel_id or access_token — skipping");
    return;
  }

  const userData: Record<string, unknown> = {
    em: sha256(input.email),
  };
  if (input.phone) userData.ph = hashPhone(input.phone);
  if (input.clientIp) userData.ip = input.clientIp;
  if (input.clientUserAgent) userData.ua = input.clientUserAgent;
  if (input.ttp) userData.ttp = input.ttp;
  if (input.ttclid) userData.ttclid = input.ttclid;

  const payload = {
    pixel_code: input.pixelId,
    event: input.eventName,
    event_id: `${input.eventName.toLowerCase()}_${input.orderId}`,
    timestamp: new Date().toISOString(),
    context: {
      user: userData,
      ...(input.value !== undefined
        ? {
            properties: {
              currency: input.currency ?? "COP",
              value: input.value,
              content_id: input.orderId,
              content_type: "product",
            },
          }
        : {}),
    },
  };

  try {
    const res = await fetch(TIKTOK_EVENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": input.accessToken,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[TikTok Events] Error (${input.eventName}):`, text);
    } else {
      console.log(`[TikTok Events] ${input.eventName} sent for order ${input.orderId}`);
    }
  } catch (err) {
    console.error("[TikTok Events] Fetch error:", err);
  }
}

export async function sendTikTokPurchase(
  input: Omit<TikTokEventInput, "eventName">
): Promise<void> {
  return sendTikTokEvent({ ...input, eventName: "CompletePayment" });
}
