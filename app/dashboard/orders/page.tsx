import { createServerClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function OrdersPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase.from("brand_members").select("brand_id").eq("user_id", user!.id).single();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("brand_id", membership?.brand_id)
    .order("created_at", { ascending: false })
    .limit(100);

  const statusColors: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failure: "bg-red-100 text-red-700",
    in_process: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Cliente", "Fecha", "Método", "Estado", "Total", "Shopify"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Sin pedidos aún.</td></tr>
            )}
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{order.first_name} {order.last_name}</p>
                  <p className="text-xs text-gray-400">{order.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {new Date(order.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.payment_method === "contraentrega" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>
                    {order.payment_method === "contraentrega" ? "COD" : "MP"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatCOP(Number(order.total))}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {order.shopify_order_id ? `#${order.shopify_order_id}` : order.shopify_error ? "⚠ Error" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
