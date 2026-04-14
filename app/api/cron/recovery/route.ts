import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { safeDecrypt } from "@/lib/encryption";
import { sendWhatsAppText, buildRecoveryMessage } from "@/lib/whatsapp";
import { sendRecoveryEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://paypixel.com";

// Tiempos de recuperación (en minutos desde created_at)
const STEPS = [
  { step: 1, minDelay: 30, maxDelay: 90, channel: "whatsapp" },
  { step: 2, minDelay: 120, maxDelay: 300, channel: "email" },
  { step: 3, minDelay: 1440, maxDelay: 2880, channel: "email" },
  { step: 4, minDelay: 4320, maxDelay: 7200, channel: "whatsapp" },
] as const;

export async function GET(req: NextRequest) {
  // Verificar secret del cron
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  let processed = 0;
  let errors = 0;

  // Obtener carritos sin convertir
  const { data: carts, error } = await supabase
    .from("abandoned_carts")
    .select(`
      *,
      brands (
        id, name, primary_color, logo_url, slug,
        whatsapp_enabled, whatsapp_phone_id, whatsapp_token,
        email_recovery_enabled, plan,
        launch_promo
      )
    `)
    .is("converted_at", null)
    .lt("recovery_step", 4)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[Recovery Cron] Error fetching carts:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  for (const cart of carts ?? []) {
    const brand = cart.brands;
    if (!brand) continue;

    const minutesSinceCreated =
      (now.getTime() - new Date(cart.created_at).getTime()) / 60000;
    const minutesSinceLastSent = cart.last_sent_at
      ? (now.getTime() - new Date(cart.last_sent_at).getTime()) / 60000
      : Infinity;

    // Determinar el próximo step
    const nextStepConfig = STEPS.find((s) => s.step === cart.recovery_step + 1);
    if (!nextStepConfig) continue;

    // Verificar si es momento de enviar
    if (minutesSinceCreated < nextStepConfig.minDelay) continue;
    if (minutesSinceLastSent < nextStepConfig.minDelay / 2) continue;

    // Solo recuperación disponible en plan pagado (o en promo)
    const canSendRecovery = brand.plan === "paid" || brand.launch_promo;
    if (!canSendRecovery) continue;

    const recoveryUrl = `${APP_URL}/checkout/${brand.slug}?recover=${cart.id}`;
    const productName =
      (cart.items as Array<{ name: string }>)[0]?.name ?? "tu producto";

    try {
      if (
        nextStepConfig.channel === "whatsapp" &&
        brand.whatsapp_enabled &&
        brand.whatsapp_phone_id &&
        cart.phone
      ) {
        const whatsappToken = safeDecrypt(brand.whatsapp_token);
        if (whatsappToken) {
          const message = buildRecoveryMessage(nextStepConfig.step, {
            firstName: cart.first_name ?? "cliente",
            productName,
            recoveryUrl,
            brandName: brand.name,
          });

          await sendWhatsAppText({
            phoneId: brand.whatsapp_phone_id,
            accessToken: whatsappToken,
            to: cart.phone,
            body: message,
          });

          await supabase.from("recovery_events").insert({
            brand_id: brand.id,
            abandoned_cart_id: cart.id,
            channel: "whatsapp",
            status: "sent",
          });
        }
      } else if (
        nextStepConfig.channel === "email" &&
        brand.email_recovery_enabled &&
        cart.email
      ) {
        const items = cart.items as Array<{ name: string; image?: string; price: number; quantity: number }>;
        const firstItem = items[0];

        await sendRecoveryEmail({
          to: cart.email,
          firstName: cart.first_name ?? "cliente",
          brandName: brand.name,
          brandLogo: brand.logo_url,
          primaryColor: brand.primary_color ?? "#6366f1",
          productName,
          productImage: firstItem?.image ?? null,
          total: cart.total ?? 0,
          recoveryUrl,
          subject:
            nextStepConfig.step === 2
              ? `¡Oye ${cart.first_name ?? ""}! Tu pedido de ${productName} sigue esperándote`
              : `Último aviso: tu pedido está por agotarse 🚨`,
        });

        await supabase.from("recovery_events").insert({
          brand_id: brand.id,
          abandoned_cart_id: cart.id,
          channel: "email",
          status: "sent",
        });
      }

      // Actualizar step
      await supabase
        .from("abandoned_carts")
        .update({
          recovery_step: nextStepConfig.step,
          last_sent_at: now.toISOString(),
        })
        .eq("id", cart.id);

      processed++;
    } catch (err) {
      console.error(`[Recovery Cron] Error for cart ${cart.id}:`, err);
      errors++;
    }
  }

  console.log(`[Recovery Cron] Processed: ${processed}, Errors: ${errors}`);
  return NextResponse.json({ ok: true, processed, errors });
}
