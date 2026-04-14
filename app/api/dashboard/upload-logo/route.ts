import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: membership } = await supabase
    .from("brand_members").select("brand_id").eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "Sin marca" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });

  if (file.size > 2 * 1024 * 1024)
    return NextResponse.json({ error: "Máximo 2MB" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${membership.brand_id}/logo.${ext}`;

  const service = createServiceClient();
  const { error: uploadError } = await service.storage
    .from("brand-logos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("[UploadLogo]", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = service.storage.from("brand-logos").getPublicUrl(path);
  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

  await service.from("brands").update({ logo_url: urlWithCacheBust }).eq("id", membership.brand_id);

  return NextResponse.json({ ok: true, url: urlWithCacheBust });
}
