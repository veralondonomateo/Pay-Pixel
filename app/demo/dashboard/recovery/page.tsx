function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

const CARTS = [
  { id: "c01", first_name: "Sofía", email: "sofia@gmail.com", phone: "573001234567", items: 2, total: 185000, recovery_step: 3, converted_at: "2024-04-12T16:00:00Z", created_at: "2024-04-12T10:00:00Z" },
  { id: "c02", first_name: "Felipe", email: "felipe@hotmail.com", phone: null, items: 1, total: 95000, recovery_step: 2, converted_at: "2024-04-11T14:30:00Z", created_at: "2024-04-11T12:00:00Z" },
  { id: "c03", first_name: "Daniela", email: "dani@gmail.com", phone: "573109876543", items: 3, total: 310000, recovery_step: 1, converted_at: null, created_at: "2024-04-12T13:45:00Z" },
  { id: "c04", first_name: "Tomás", email: "tomas@outlook.com", phone: null, items: 2, total: 220000, recovery_step: 2, converted_at: null, created_at: "2024-04-12T09:20:00Z" },
  { id: "c05", first_name: "Mariana", email: "mariana@gmail.com", phone: "573205551234", items: 1, total: 140000, recovery_step: 0, converted_at: null, created_at: "2024-04-12T14:10:00Z" },
  { id: "c06", first_name: "Alejandro", email: "alex@gmail.com", phone: "573001112233", items: 2, total: 270000, recovery_step: 3, converted_at: "2024-04-10T18:00:00Z", created_at: "2024-04-10T15:00:00Z" },
  { id: "c07", first_name: "Isabella", email: "isa@gmail.com", phone: null, items: 1, total: 185000, recovery_step: 1, converted_at: null, created_at: "2024-04-11T11:00:00Z" },
  { id: "c08", first_name: "Nicolás", email: "nico@gmail.com", phone: "573204445566", items: 4, total: 370000, recovery_step: 2, converted_at: "2024-04-09T20:00:00Z", created_at: "2024-04-09T17:00:00Z" },
];

const stepLabels: Record<number, string> = {
  0: "Recién abandonado",
  1: "WhatsApp 30min enviado",
  2: "Email 2h enviado",
  3: "Email 24h enviado",
  4: "WhatsApp 72h enviado",
};

export default function DemoRecoveryPage() {
  const converted = CARTS.filter((c) => c.converted_at);
  const pending = CARTS.filter((c) => !c.converted_at);
  const recoveryRate = Math.round((converted.length / CARTS.length) * 100);
  const recoveredRevenue = converted.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recuperación de carritos</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tasa de recuperación", value: `${recoveryRate}%`, sub: `${converted.length} de ${CARTS.length} carritos` },
          { label: "Revenue recuperado", value: formatCOP(recoveredRevenue), sub: "Abril 2024" },
          { label: "Pendientes de recuperar", value: pending.length.toString(), sub: "En secuencia activa" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recovery sequence explanation */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Secuencia de recuperación automática</h3>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            { time: "0 min", icon: "🛒", label: "Abandono detectado", color: "bg-gray-100 text-gray-700" },
            { time: "30 min", icon: "💬", label: "WhatsApp 1", color: "bg-green-50 text-green-700" },
            { time: "2 horas", icon: "📧", label: "Email 1", color: "bg-blue-50 text-blue-700" },
            { time: "24 horas", icon: "📧", label: "Email 2", color: "bg-blue-50 text-blue-700" },
            { time: "72 horas", icon: "💬", label: "WhatsApp 2", color: "bg-green-50 text-green-700" },
          ].map((step, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className={`text-center px-4 py-3 rounded-xl ${step.color} min-w-[100px]`}>
                <p className="text-lg mb-1">{step.icon}</p>
                <p className="text-xs font-semibold">{step.label}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{step.time}</p>
              </div>
              {i < 4 && (
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-gray-200" />
                  <svg className="w-2 h-2 text-gray-400 -ml-1" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M0 0l8 4-8 4z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Carts list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Carritos abandonados</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {CARTS.map((cart) => (
            <div key={cart.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold flex-shrink-0">
                {cart.first_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{cart.first_name}</p>
                <p className="text-xs text-gray-400">
                  {cart.email}
                  {cart.phone && <> · {cart.phone}</>}
                </p>
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">{cart.items} producto(s)</div>
              <div className="text-xs text-gray-400 hidden md:block max-w-[140px] truncate">
                {cart.converted_at ? "—" : stepLabels[cart.recovery_step]}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${cart.converted_at ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {cart.converted_at ? "Recuperado" : `Paso ${cart.recovery_step}`}
              </span>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatCOP(cart.total)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
