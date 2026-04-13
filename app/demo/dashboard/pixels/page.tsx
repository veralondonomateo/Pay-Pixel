export default function DemoPixelsPage() {
  const events = [
    { time: "14:32", event: "Purchase", source: "Browser + CAPI", customer: "María G.", value: "$185.000", dedup: "purchase_ord_001", status: "ok" },
    { time: "13:15", event: "InitiateCheckout", source: "Browser", customer: "Carlos L.", value: "$220.000", dedup: "ic_ord_002", status: "ok" },
    { time: "11:48", event: "Purchase", source: "Browser + CAPI", customer: "Ana M.", value: "$160.000", dedup: "purchase_ord_003", status: "ok" },
    { time: "10:22", event: "AddToCart", source: "Browser", customer: "Anónimo", value: "$95.000", dedup: "atc_abc123", status: "ok" },
    { time: "09:15", event: "Purchase", source: "Browser + CAPI", customer: "Luis R.", value: "$310.000", dedup: "purchase_ord_004", status: "ok" },
    { time: "08:40", event: "ViewContent", source: "Browser", customer: "Anónimo", value: "—", dedup: "vc_xyz789", status: "ok" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Píxeles & Atribución</h1>

      {/* Pixel status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            name: "Meta Pixel",
            platform: "Facebook/Instagram",
            pixelId: "1234567890123456",
            color: "bg-blue-600",
            status: "Configurado",
            events: 198,
            matchRate: "87%",
          },
          {
            name: "TikTok Pixel",
            platform: "TikTok Ads",
            pixelId: "C4BXXXXXXXX",
            color: "bg-black",
            status: "Configurado",
            events: 142,
            matchRate: "82%",
          },
          {
            name: "Meta CAPI",
            platform: "Server-side · Conversions API",
            pixelId: "Token: EAAx••••••••",
            color: "bg-blue-500",
            status: "Activo",
            events: 198,
            matchRate: "94%",
          },
          {
            name: "TikTok Events API",
            platform: "Server-side · v1.3",
            pixelId: "Token: ••••••••",
            color: "bg-gray-800",
            status: "Activo",
            events: 142,
            matchRate: "91%",
          },
        ].map((pixel) => (
          <div key={pixel.name} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 ${pixel.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{pixel.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{pixel.name}</p>
                <p className="text-xs text-gray-500 truncate">{pixel.platform}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700 flex-shrink-0">
                {pixel.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-2 mb-3 truncate">
              {pixel.pixelId}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500">Eventos hoy: </span>
                <span className="font-semibold text-gray-900">{pixel.events}</span>
              </div>
              <div>
                <span className="text-gray-500">Match rate: </span>
                <span className="font-semibold text-green-700">{pixel.matchRate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attribution explanation */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <h3 className="font-semibold text-indigo-900 text-sm mb-3">¿Cómo funciona la atribución de PayPixel?</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "El checkout corre en tu mismo dominio → _fbp y ttclid nunca se rompen",
            "Cada compra dispara el píxel en el browser Y desde el servidor (CAPI)",
            "La deduplicación via event_id evita contar el evento dos veces en Meta",
            "Los adblockers e iOS 14 no pueden bloquear el server-side event",
            "Email y teléfono se hashean con SHA256 antes de enviarse",
            "Se envían _fbp, _fbc, _ttp, IP y user-agent para máximo match rate",
          ].map((point) => (
            <div key={point} className="flex items-start gap-2 text-xs text-indigo-700">
              <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {point}
            </div>
          ))}
        </div>
      </div>

      {/* Recent events log */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Log de eventos recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Hora", "Evento", "Origen", "Cliente", "Valor", "Event ID", "Estado"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-gray-500 font-semibold uppercase tracking-wide text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((ev, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-500 font-mono">{ev.time}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900">{ev.event}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded font-medium ${ev.source.includes("CAPI") ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                      {ev.source}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{ev.customer}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900">{ev.value}</td>
                  <td className="px-4 py-2.5 font-mono text-gray-400">{ev.dedup}</td>
                  <td className="px-4 py-2.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
