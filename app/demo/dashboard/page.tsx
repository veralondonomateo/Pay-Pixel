function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

const RECENT_ORDERS = [
  { id: "1", first_name: "María", last_name: "García", total: 185000, payment_method: "mercadopago", payment_status: "approved", created_at: "2024-04-12T14:32:00Z" },
  { id: "2", first_name: "Carlos", last_name: "López", total: 220000, payment_method: "contraentrega", payment_status: "pending", created_at: "2024-04-12T13:15:00Z" },
  { id: "3", first_name: "Ana", last_name: "Martínez", total: 160000, payment_method: "mercadopago", payment_status: "approved", created_at: "2024-04-12T11:48:00Z" },
  { id: "4", first_name: "Luis", last_name: "Rodríguez", total: 310000, payment_method: "mercadopago", payment_status: "approved", created_at: "2024-04-11T18:22:00Z" },
  { id: "5", first_name: "Valentina", last_name: "Torres", total: 95000, payment_method: "contraentrega", payment_status: "approved", created_at: "2024-04-11T10:05:00Z" },
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

export default function DemoDashboardPage() {
  const stats = [
    { label: "Pedidos este mes", value: "247", sub: "+12% vs mes anterior" },
    { label: "Revenue total", value: formatCOP(44460000), sub: "Abril 2024" },
    { label: "Ticket promedio (AOV)", value: formatCOP(180000), sub: "+5% vs mes anterior" },
    { label: "Carritos abandonados", value: "83", sub: "28 recuperados (34%)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resumen</h1>
        <p className="text-sm text-gray-500 mt-1">abril de 2024</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Attribution summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">M</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">Meta CAPI</span>
            <span className="ml-auto text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Activo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">198</p>
          <p className="text-xs text-gray-500 mt-0.5">eventos enviados hoy</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">T</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">TikTok Events</span>
            <span className="ml-auto text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Activo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">142</p>
          <p className="text-xs text-gray-500 mt-0.5">eventos enviados hoy</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">W</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">WhatsApp Recovery</span>
            <span className="ml-auto text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Activo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCOP(5040000)}</p>
          <p className="text-xs text-gray-500 mt-0.5">revenue recuperado este mes</p>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">Pedidos recientes</h2>
          <a href="/demo/dashboard/orders" className="text-xs text-indigo-600 hover:text-indigo-700">
            Ver todos →
          </a>
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT_ORDERS.map((order) => (
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
                {statusLabels[order.payment_status] ?? order.payment_status}
              </span>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                {formatCOP(order.total)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
