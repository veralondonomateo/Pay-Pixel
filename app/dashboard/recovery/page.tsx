import { createServerClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function RecoveryPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase.from("brand_members").select("brand_id").eq("user_id", user!.id).single();
  const brandId = membership?.brand_id;

  const { data: carts } = await supabase
    .from("abandoned_carts")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(50);

  const converted = carts?.filter((c) => c.converted_at) ?? [];
  const pending = carts?.filter((c) => !c.converted_at) ?? [];
  const recoveryRate = carts?.length ? Math.round((converted.length / carts.length) * 100) : 0;
  const recoveredRevenue = converted.reduce((s, c) => s + (Number(c.total) ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recuperación de carritos</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tasa de recuperación", value: `${recoveryRate}%` },
          { label: "Revenue recuperado", value: formatCOP(recoveredRevenue) },
          { label: "Pendientes de recuperar", value: pending.length.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Carritos abandonados</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(carts ?? []).length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">Sin carritos aún.</p>
          )}
          {(carts ?? []).map((cart) => (
            <div key={cart.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{cart.first_name ?? "Anónimo"}</p>
                <p className="text-xs text-gray-400">{cart.email ?? cart.phone ?? "Sin contacto"}</p>
              </div>
              <div className="text-xs text-gray-500">{(cart.items as any[]).length} producto(s)</div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cart.converted_at ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {cart.converted_at ? "Recuperado" : `Paso ${cart.recovery_step}`}
              </span>
              <p className="text-sm font-semibold text-gray-900">{formatCOP(Number(cart.total) ?? 0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
