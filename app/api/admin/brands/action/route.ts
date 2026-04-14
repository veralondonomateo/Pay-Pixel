import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Verificar que el usuario es admin
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const service = createServiceClient();
  const { data: adminRow } = await service
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { brandId, action } = await req.json();
  if (!brandId || !action) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  if (action === "toggle_active") {
    const { data: brand } = await service.from("brands").select("is_active").eq("id", brandId).single();
    await service.from("brands").update({ is_active: !brand?.is_active }).eq("id", brandId);
  } else if (action === "toggle_promo") {
    const { data: brand } = await service.from("brands").select("launch_promo").eq("id", brandId).single();
    await service.from("brands").update({ launch_promo: !brand?.launch_promo }).eq("id", brandId);
  } else if (action === "mark_paid") {
    await service.from("billing_records")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("brand_id", brandId)
      .eq("status", "pending");
    await service.from("brands").update({ plan: "paid" }).eq("id", brandId);
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
