function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

const ORDERS = [
  { id: "ord_001", first_name: "María", last_name: "García", email: "maria@gmail.com", total: 185000, payment_method: "mercadopago", payment_status: "approved", shopify_order_id: "5123456789", created_at: "2024-04-12T14:32:00Z" },
  { id: "ord_002", first_name: "Carlos", last_name: "López", email: "carlos.l@hotmail.com", total: 220000, payment_method: "contraentrega", payment_status: "pending", shopify_order_id: "5123456790", created_at: "2024-04-12T13:15:00Z" },
  { id: "ord_003", first_name: "Ana", last_name: "Martínez", email: "ana.martinez@gmail.com", total: 160000, payment_method: "mercadopago", payment_status: "approved", shopify_order_id: "5123456791", created_at: "2024-04-12T11:48:00Z" },
  { id: "ord_004", first_name: "Luis", last_name: "Rodríguez", email: "luisrod@outlook.com", total: 310000, payment_method: "mercadopago", payment_status: "approved", shopify_order_id: "5123456792", created_at: "2024-04-11T18:22:00Z" },
  { id: "ord_005", first_name: "Valentina", last_name: "Torres", email: "vale.torres@gmail.com", total: 95000, payment_method: "contraentrega", payment_status: "approved", shopify_order_id: "5123456793", created_at: "2024-04-11T10:05:00Z" },
  { id: "ord_006", first_name: "Sebastián", last_name: "Gómez", email: "sebas@gmail.com", total: 185000, payment_method: "mercadopago", payment_status: "approved", shopify_order_id: "5123456794", created_at: "2024-04-10T16:41:00Z" },
  { id: "ord_007", first_name: "Camila", last_name: "Herrera", email: "cami.h@gmail.com", total: 370000, payment_method: "mercadopago", payment_status: "approved", shopify_order_id: "5123456795", created_at: "2024-04-10T14:20:00Z" },
  { id: "ord_008", first_name: "Daniel", last_name: "Morales", email: "dani.morales@gmail.com", total: 140000, payment_method: "contraentrega", payment_status: "failure", shopify_order_id: null, created_at: "2024-04-10T09:33:00Z" },
  { id: "ord_009", first_name: "Laura", last_name: "Jiménez", email: "laura.jim@yahoo.com", total: 220000, payment_method: "mercadopago", payment_status: "approved", shopify_order_id: "5123456796", created_at: "2024-04-09T20:15:00Z" },
  { id: "ord_010", first_name: "Andrés", last_name: "Vargas", email: "andresv@gmail.com", total: 185000, payment_method: "contraentrega", payment_status: "approved", shopify_order_id: "5123456797", created_at: "2024-04-09T15:08:00Z" },
];

const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failure: "bg-red-100 text-red-700",
  in_process: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<string, string> = {
  approved: "Aprobado",
  pending: "Pendiente",
  failure: "Fallido",
  in_process: "En proceso",
};

export default function DemoOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          247 pedidos este mes
        </div>
      </div>
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
            {ORDERS.map((order) => (
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
                    {statusLabels[order.payment_status] ?? order.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatCOP(order.total)}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {order.shopify_order_id ? `#${order.shopify_order_id}` : "⚠ Error"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
