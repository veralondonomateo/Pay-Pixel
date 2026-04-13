import { createServerClient } from "@/lib/supabase";

export default async function PixelsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Píxeles & Atribución</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Meta Pixel", platform: "Facebook/Instagram", color: "bg-blue-600", status: "Configurado" },
          { name: "TikTok Pixel", platform: "TikTok Ads", color: "bg-black", status: "Configurado" },
          { name: "Meta CAPI", platform: "Server-side", color: "bg-blue-500", status: "Activo" },
          { name: "TikTok Events API", platform: "Server-side", color: "bg-gray-800", status: "Activo" },
        ].map((pixel) => (
          <div key={pixel.name} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 ${pixel.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{pixel.name[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{pixel.name}</p>
                <p className="text-xs text-gray-500">{pixel.platform}</p>
              </div>
              <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">
                {pixel.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Los eventos de compra se envían con deduplicación automática via event_id.
              Incluye email SHA256, teléfono, IP, user-agent, _fbp, _fbc y _ttp.
            </p>
          </div>
        ))}
      </div>
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <h3 className="font-semibold text-indigo-900 text-sm mb-2">¿Cómo funciona la atribución de PayPixel?</h3>
        <ul className="space-y-1.5 text-xs text-indigo-700">
          <li>• El checkout corre en tu mismo dominio → <strong>_fbp y ttclid nunca se rompen</strong></li>
          <li>• Cada compra dispara el píxel en el browser <strong>y</strong> desde el servidor (CAPI)</li>
          <li>• La deduplicación via event_id evita contar el evento dos veces</li>
          <li>• Los adblockers e iOS 14 no pueden bloquear el server-side event</li>
        </ul>
      </div>
    </div>
  );
}
