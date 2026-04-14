import { createServiceClient } from "@/lib/supabase";

export default async function AdminBrandsPage() {
  const supabase = createServiceClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, slug, billing_email, plan, launch_promo, is_active, created_at")
    .order("created_at", { ascending: false });

  // Contar pedidos del mes por marca
  const { data: ordersThisMonth } = await supabase
    .from("orders")
    .select("brand_id")
    .eq("payment_status", "approved")
    .gte("created_at", monthStart);

  const ordersByBrand: Record<string, number> = {};
  for (const o of ordersThisMonth ?? []) {
    ordersByBrand[o.brand_id] = (ordersByBrand[o.brand_id] ?? 0) + 1;
  }

  const active = brands?.filter((b) => b.is_active).length ?? 0;
  const paid = brands?.filter((b) => b.plan === "paid").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Marcas</h1>
          <p className="text-gray-500 text-sm mt-1">{brands?.length ?? 0} registradas</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center">
            <p className="text-emerald-400 font-bold text-lg">{active}</p>
            <p className="text-emerald-500/70 text-xs">Activas</p>
          </div>
          <div className="px-4 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-center">
            <p className="text-indigo-400 font-bold text-lg">{paid}</p>
            <p className="text-indigo-500/70 text-xs">Pagadas</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-white/5 overflow-hidden"
        style={{ background: "rgba(10,10,20,0.7)", backdropFilter: "blur(10px)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Marca", "Email", "Pedidos / mes", "Plan", "Estado", "Registro", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {(brands ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-600">Sin marcas.</td></tr>
            )}
            {(brands ?? []).map((brand) => (
              <tr key={brand.id} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-300 text-xs font-bold">{brand.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{brand.name}</p>
                      <p className="text-xs text-gray-600 font-mono">{brand.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-500 text-xs">{brand.billing_email ?? "—"}</td>
                <td className="px-4 py-3.5">
                  <span className="text-white font-semibold">{ordersByBrand[brand.id] ?? 0}</span>
                  <span className="text-gray-600 text-xs ml-1">/ 100 gratis</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    brand.plan === "paid"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-gray-800/60 text-gray-400 border-gray-700"
                  }`}>
                    {brand.plan === "paid" ? "Pagado" : "Free"}{brand.launch_promo ? " 🎁" : ""}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    brand.is_active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {brand.is_active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-600 text-xs">
                  {new Date(brand.created_at).toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-3.5">
                  <a href={`/admin/brands/${brand.id}`}
                    className="text-xs text-indigo-400 hover:text-white font-medium transition-colors opacity-0 group-hover:opacity-100">
                    Ver →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
