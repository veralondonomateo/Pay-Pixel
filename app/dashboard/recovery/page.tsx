import { createServerClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function RecoveryPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase
    .from("brand_members").select("brand_id, brands(primary_color)").eq("user_id", user!.id).single();

  const brandId = membership?.brand_id;
  const brandRaw = (membership as any)?.brands;
  const color = (Array.isArray(brandRaw) ? brandRaw[0] : brandRaw)?.primary_color ?? "#6366f1";

  const { data: carts } = await supabase
    .from("abandoned_carts").select("*")
    .eq("brand_id", brandId).order("created_at", { ascending: false }).limit(60);

  const converted = carts?.filter((c) => c.converted_at) ?? [];
  const pending   = carts?.filter((c) => !c.converted_at) ?? [];
  const rate      = carts?.length ? Math.round((converted.length / carts.length) * 100) : 0;
  const recovered = converted.reduce((s, c) => s + Number(c.total ?? 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Recuperación de carritos</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{carts?.length ?? 0} carritos totales</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tasa de recuperación", value: `${rate}%`, highlight: rate > 0 },
          { label: "Revenue recuperado",   value: formatCOP(recovered), highlight: recovered > 0 },
          { label: "Pendientes",           value: pending.length.toString(), highlight: false },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4"
            style={{ background: s.highlight ? `${color}0d` : "rgba(255,255,255,0.03)", border: `1px solid ${s.highlight ? color + "20" : "rgba(255,255,255,0.06)"}` }}>
            <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.highlight ? color : "white" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recovery steps legend */}
      <div className="rounded-2xl p-4 flex items-center gap-6"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { step: 0, label: "Sin intentos" },
          { step: 1, label: "WhatsApp 1" },
          { step: 2, label: "Email 1" },
          { step: 3, label: "Email 2" },
          { step: 4, label: "WhatsApp 2" },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: s.step === 0 ? "rgba(255,255,255,0.06)" : `${color}20`, color: s.step === 0 ? "rgba(255,255,255,0.3)" : color, border: `1px solid ${s.step === 0 ? "rgba(255,255,255,0.08)" : color + "30"}` }}>
              {s.step}
            </div>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-sm font-semibold text-white">Carritos abandonados</p>
        </div>
        <div>
          {(carts ?? []).length === 0 && (
            <p className="px-5 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>Sin carritos aún.</p>
          )}
          {(carts ?? []).map((cart) => (
            <div key={cart.id} className="px-5 py-3.5 flex items-center gap-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{cart.first_name ?? "Anónimo"}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {cart.email ?? cart.phone ?? "Sin contacto"}
                </p>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                {(cart.items as any[]).length} producto(s)
              </p>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={ cart.converted_at
                  ? { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }
                  : { background: `${color}12`, color, border: `1px solid ${color}25` }}>
                {cart.converted_at ? "✓ Recuperado" : `Paso ${cart.recovery_step}`}
              </span>
              <p className="text-sm font-bold text-white flex-shrink-0">
                {formatCOP(Number(cart.total ?? 0))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
