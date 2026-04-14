import { createServiceClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function AdminPage() {
  const supabase = createServiceClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [brandsResult, ordersResult, revenueResult, pendingBillingResult] = await Promise.all([
    supabase.from("brands").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("orders").select("*", { count: "exact", head: true })
      .eq("payment_status", "approved").gte("created_at", monthStart),
    supabase.from("orders").select("total")
      .eq("payment_status", "approved").gte("created_at", monthStart),
    supabase.from("billing_records").select("amount_cop").eq("status", "pending"),
  ]);

  const totalBrands = brandsResult.count ?? 0;
  const ordersThisMonth = ordersResult.count ?? 0;
  const revenueThisMonth = (revenueResult.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const pendingBilling = (pendingBillingResult.data ?? []).reduce((s, r) => s + Number(r.amount_cop), 0);

  // Últimas marcas registradas
  const { data: recentBrands } = await supabase
    .from("brands")
    .select("id, name, slug, plan, launch_promo, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { label: "Marcas activas", value: totalBrands.toString(), color: "indigo" },
    { label: "Pedidos este mes", value: ordersThisMonth.toString(), color: "green" },
    { label: "Revenue procesado", value: formatCOP(revenueThisMonth), color: "purple" },
    { label: "Facturación pendiente", value: formatCOP(pendingBilling), color: "orange" },
  ];

  const colorMap: Record<string, string> = {
    indigo: "text-indigo-400",
    green: "text-green-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Resumen global</h1>
        <p className="text-gray-500 text-sm mt-1">
          {now.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${colorMap[stat.color]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Marcas recientes */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">Últimas marcas registradas</h2>
          <a href="/admin/brands" className="text-xs text-indigo-400 hover:text-indigo-300">Ver todas →</a>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr>
              {["Marca", "Slug", "Plan", "Estado", "Registro"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(recentBrands ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600 text-sm">Sin marcas aún.</td></tr>
            )}
            {(recentBrands ?? []).map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <a href={`/admin/brands/${brand.id}`} className="font-medium text-white hover:text-indigo-400 transition-colors">
                    {brand.name}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{brand.slug}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    brand.plan === "paid" ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"
                  }`}>
                    {brand.plan === "paid" ? "Pagado" : "Free"}
                    {brand.launch_promo && " 🎁"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    brand.is_active ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
                  }`}>
                    {brand.is_active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(brand.created_at).toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
