import MercadoPagoConfig, { Preference } from "mercadopago";
import { CheckoutItem } from "@/types/checkout";

export interface MPPreferenceInput {
  accessToken: string;
  orderId: string;
  brandSlug: string;
  appUrl: string;
  items: CheckoutItem[];
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  cedula?: string | null;
  couponCode?: string;
  discount?: number;
  statementDescriptor?: string;
}

export async function createMPPreference(input: MPPreferenceInput): Promise<{
  preferenceId: string;
  initPoint: string;
}> {
  const client = new MercadoPagoConfig({ accessToken: input.accessToken });
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: input.items.map((item) => ({
        id: item.id,
        title: item.variant ? `${item.name} – ${item.variant}` : item.name,
        description: item.variant
          ? `${item.name} – ${item.variant}`
          : item.name,
        category_id: "health_and_beauty",
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "COP",
        picture_url: item.image,
      })),
      payer: {
        name: input.firstName,
        surname: input.lastName,
        email: input.email,
        phone: { number: input.phone },
        address: { street_name: input.address },
        ...(input.cedula
          ? { identification: { type: "CC", number: input.cedula } }
          : {}),
      },
      back_urls: {
        success: `${input.appUrl}/checkout/${input.brandSlug}/thank-you?status=success&order_id=${input.orderId}`,
        failure: `${input.appUrl}/checkout/${input.brandSlug}/thank-you?status=failure&order_id=${input.orderId}`,
        pending: `${input.appUrl}/checkout/${input.brandSlug}/thank-you?status=pending&order_id=${input.orderId}`,
      },
      auto_return: "approved",
      statement_descriptor: input.statementDescriptor ?? "PayPixel",
      external_reference: input.orderId,
      ...(input.couponCode && input.discount && input.discount > 0
        ? {
            discounts: [
              { name: input.couponCode, amount: input.discount },
            ],
          }
        : {}),
    },
  });

  return {
    preferenceId: result.id ?? "",
    initPoint: result.init_point ?? result.sandbox_init_point ?? "",
  };
}

export async function getMPPayment(
  accessToken: string,
  paymentId: string
): Promise<{ status: string; external_reference: string }> {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error(`MP API error: ${res.status}`);
  }
  return res.json();
}

export function mapMPStatus(
  mpStatus: string
): "pending" | "approved" | "failure" | "in_process" {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "rejected":
    case "cancelled":
      return "failure";
    case "in_process":
    case "authorized":
      return "in_process";
    default:
      return "pending";
  }
}
