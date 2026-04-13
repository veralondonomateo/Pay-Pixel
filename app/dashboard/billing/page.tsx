import { createServerClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function BillingPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase.from("brand_members").select("brand_id").eq("user_id", user!.id).single();
  const brandId = membership?.brand_id;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [currentMonthOrders, billingHistory] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true })
      .eq("brand_id", brandId).eq("payment_status", "approved").gte("created_at", monthStart),
    supabase.from("billing_records").select("*").eq("brand_id", brandId).order("month", { ascending: false }).limit(12),
  ]);

  const ordersThisMonth = currentMonthOrders.count ?? 0;
  const billableThisMonth = Math.max(0, ordersThisMonth - 100);
  const estimatedCOP = billableThisMonth * 1500;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>

      {/* Mes actual */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Mes actual</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Pedidos aprobados</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{ordersThisMonth}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pedidos facturables ({">"} 100)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{billableThisMonth}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Estimado a pagar</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCOP(estimatedCOP)}</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
          {ordersThisMonth <= 100
            ? `Tienes ${ordersThisMonth}/100 pedidos gratis este mes. ¡Sin costo hasta el pedido #101!`
            : `Superaste los 100 pedidos gratis. Los ${billableThisMonth} adicionales se facturan a $1,500 COP c/u.`}
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Historial de facturación</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Mes", "Total pedidos", "Facturables", "Monto", "Estado"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(billingHistory.data ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Sin historial aún.</td></tr>
            )}
            {(billingHistory.data ?? []).map((rec) => (
              <tr key={rec.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{rec.month}</td>
                <td className="px-4 py-3 text-gray-600">{rec.total_orders}</td>
                <td className="px-4 py-3 text-gray-600">{rec.billable_orders}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatCOP(rec.amount_cop)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    rec.status === "paid" ? "bg-green-100 text-green-700" :
                    rec.status === "waived" ? "bg-gray-100 text-gray-600" :
                    rec.status === "failed" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {rec.status === "paid" ? "Pagado" : rec.status === "waived" ? "Gratis" : rec.status === "failed" ? "Fallido" : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
