import { createServerClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("brand_members")
    .select("brand_id")
    .eq("user_id", user!.id)
    .single();

  const brandId = membership?.brand_id;

  // Estadísticas del mes actual
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [ordersResult, revenueResult, abandonedResult] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .eq("payment_status", "approved")
      .gte("created_at", monthStart),
    supabase
      .from("orders")
      .select("total")
      .eq("brand_id", brandId)
      .eq("payment_status", "approved")
      .gte("created_at", monthStart),
    supabase
      .from("abandoned_carts")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .is("converted_at", null)
      .gte("created_at", monthStart),
  ]);

  const totalOrders = ordersResult.count ?? 0;
  const totalRevenue = (revenueResult.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const abandonedCount = abandonedResult.count ?? 0;

  // Pedidos recientes
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, first_name, last_name, total, payment_method, payment_status, created_at")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Pedidos este mes", value: totalOrders.toString(), color: "indigo" },
    { label: "Revenue total", value: formatCOP(totalRevenue), color: "green" },
    { label: "Ticket promedio (AOV)", value: formatCOP(aov), color: "purple" },
    { label: "Carritos abandonados", value: abandonedCount.toString(), color: "orange" },
  ];

  const statusColors: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failure: "bg-red-100 text-red-700",
    in_process: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resumen</h1>
        <p className="text-sm text-gray-500 mt-1">
          {now.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">Pedidos recientes</h2>
          <a href="/dashboard/orders" className="text-xs text-indigo-600 hover:text-indigo-700">
            Ver todos →
          </a>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders?.length === 0 && (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">
              Aún no tienes pedidos este mes.
            </p>
          )}
          {recentOrders?.map((order) => (
            <div key={order.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {order.first_name} {order.last_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString("es-CO")} ·{" "}
                  {order.payment_method === "contraentrega" ? "Contraentrega" : "MercadoPago"}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                {order.payment_status === "approved" ? "Aprobado" :
                 order.payment_status === "pending" ? "Pendiente" :
                 order.payment_status === "failure" ? "Fallido" : "En proceso"}
              </span>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                {formatCOP(Number(order.total))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
