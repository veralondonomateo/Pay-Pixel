import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const CRON_SECRET = process.env.CRON_SECRET;
const FREE_TIER_LIMIT = 100;
const PRICE_PER_ORDER_COP = 1500;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Calcular el mes anterior
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = `${monthStr}-01T00:00:00.000Z`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Obtener todas las marcas activas
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, billing_email, plan, launch_promo, created_at")
    .eq("is_active", true);

  if (!brands) {
    return NextResponse.json({ error: "No brands found" }, { status: 500 });
  }

  let billed = 0;
  let skipped = 0;

  for (const brand of brands) {
    // ── Verificar si aplica el período de promo (3 meses) ────────────────────
    if (brand.launch_promo) {
      const brandCreated = new Date(brand.created_at);
      const monthsSinceCreation =
        (prevMonth.getFullYear() - brandCreated.getFullYear()) * 12 +
        (prevMonth.getMonth() - brandCreated.getMonth());
      if (monthsSinceCreation < 3) {
        skipped++;
        continue; // Promo: primeros 3 meses gratis
      }
    }

    // Contar órdenes aprobadas del mes anterior
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brand.id)
      .eq("payment_status", "approved")
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd);

    const totalOrders = count ?? 0;
    const billableOrders = Math.max(0, totalOrders - FREE_TIER_LIMIT);
    const amountCOP = billableOrders * PRICE_PER_ORDER_COP;

    // Verificar que no exista ya un registro para este mes
    const { data: existing } = await supabase
      .from("billing_records")
      .select("id")
      .eq("brand_id", brand.id)
      .eq("month", monthStr)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    // Insertar registro de facturación
    await supabase.from("billing_records").insert({
      brand_id: brand.id,
      month: monthStr,
      total_orders: totalOrders,
      billable_orders: billableOrders,
      amount_cop: amountCOP,
      status: billableOrders === 0 ? "waived" : "pending",
    });

    // Actualizar plan
    if (billableOrders > 0) {
      await supabase
        .from("brands")
        .update({ plan: "paid" })
        .eq("id", brand.id);
    }

    if (billableOrders > 0) billed++;
    else skipped++;
  }

  console.log(`[Billing Cron] Month: ${monthStr} — Billed: ${billed}, Skipped: ${skipped}`);
  return NextResponse.json({ ok: true, month: monthStr, billed, skipped });
}
