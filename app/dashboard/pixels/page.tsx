import { createServerClient } from "@/lib/supabase";

export default async function PixelsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase
    .from("brand_members").select("brand_id").eq("user_id", user!.id).single();

  const { data: brand } = await supabase
    .from("brands")
    .select("primary_color, meta_pixel_id, meta_conversions_token, tiktok_pixel_id, tiktok_events_token, shopify_domain, mp_access_token, whatsapp_enabled, whatsapp_phone_id")
    .eq("id", membership!.brand_id)
    .single();

  const color = brand?.primary_color ?? "#6366f1";

  // Estado real basado en los datos de la marca
  const integrations = [
    {
      name: "Meta Pixel",
      description: "Browser-side — dispara en cada pageview y evento de compra del navegador",
      badge: "Client-side",
      connected: !!brand?.meta_pixel_id,
      detail: brand?.meta_pixel_id ? `Pixel ID: ${brand.meta_pixel_id}` : "Sin Pixel ID configurado",
      action: "/dashboard/settings",
      icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
    },
    {
      name: "Meta CAPI",
      description: "Server-side — envía eventos de Purchase desde el servidor, adblocker-proof",
      badge: "Server-side",
      connected: !!(brand?.meta_pixel_id && brand?.meta_conversions_token),
      detail: brand?.meta_conversions_token ? "Token configurado ✓" : "Falta el Conversions API Token",
      action: "/dashboard/settings",
      icon: "M5 12h14M12 5l7 7-7 7",
    },
    {
      name: "TikTok Pixel",
      description: "Browser-side — tracking de eventos en el checkout para TikTok Ads",
      badge: "Client-side",
      connected: !!brand?.tiktok_pixel_id,
      detail: brand?.tiktok_pixel_id ? `Pixel ID: ${brand.tiktok_pixel_id}` : "Sin Pixel ID configurado",
      action: "/dashboard/settings",
      icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    },
    {
      name: "TikTok Events API",
      description: "Server-side — eventos de compra vía API, bypassea iOS 14 restrictions",
      badge: "Server-side",
      connected: !!(brand?.tiktok_pixel_id && brand?.tiktok_events_token),
      detail: brand?.tiktok_events_token ? "Token configurado ✓" : "Falta el Events API Token",
      action: "/dashboard/settings",
      icon: "M5 12h14M12 5l7 7-7 7",
    },
    {
      name: "Shopify",
      description: "Crea órdenes automáticamente en tu tienda tras cada compra aprobada",
      badge: "E-commerce",
      connected: !!brand?.shopify_domain,
      detail: brand?.shopify_domain ? brand.shopify_domain : "Sin tienda Shopify configurada",
      action: "/dashboard/settings",
      icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0",
    },
    {
      name: "MercadoPago",
      description: "Pasarela de pago — procesa tarjetas, PSE y más en tu checkout",
      badge: "Pagos",
      connected: !!brand?.mp_access_token,
      detail: brand?.mp_access_token ? "Access Token configurado ✓" : "Sin Access Token configurado",
      action: "/dashboard/settings",
      icon: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z",
    },
    {
      name: "WhatsApp",
      description: "Recuperación de carritos vía WhatsApp Business API",
      badge: "Recovery",
      connected: !!(brand?.whatsapp_enabled && brand?.whatsapp_phone_id),
      detail: brand?.whatsapp_phone_id ? `Phone ID: ${brand.whatsapp_phone_id}` : "Sin WhatsApp configurado",
      action: "/dashboard/settings",
      icon: "M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21 M9 10a.5.5 0 001 0V9a.5.5 0 00-1 0v1zm0 0a5 5 0 005 5m0 0a.5.5 0 000-1h-1a.5.5 0 000 1zm0 0",
    },
  ];

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Píxeles & Integraciones</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            {connectedCount}/{integrations.length} conectadas
          </p>
        </div>
        <div className="rounded-xl px-4 py-2 text-sm font-semibold"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
          {connectedCount} / {integrations.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(connectedCount / integrations.length) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map((item) => (
          <div key={item.name} className="rounded-2xl p-4 transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${item.connected ? color + "25" : "rgba(255,255,255,0.06)"}` }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: item.connected ? `${color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${item.connected ? color + "30" : "rgba(255,255,255,0.07)"}` }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ color: item.connected ? color : "rgba(255,255,255,0.25)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{item.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono" style={{ color: item.connected ? color : "rgba(255,255,255,0.2)" }}>
                    {item.detail}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {item.connected
                      ? <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                      : <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                    }
                    <span className="text-xs font-medium" style={{ color: item.connected ? color : "rgba(255,255,255,0.2)" }}>
                      {item.connected ? "Conectado" : "No configurado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {!item.connected && (
              <a href={item.action}
                className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}>
                Configurar →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="rounded-2xl p-5" style={{ background: `${color}0d`, border: `1px solid ${color}20` }}>
        <p className="text-sm font-semibold mb-2" style={{ color }}>¿Cómo funciona la atribución?</p>
        <ul className="space-y-1.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          <li>→ El checkout corre en tu dominio: <strong style={{ color: "rgba(255,255,255,0.7)" }}>_fbp y ttclid nunca se rompen</strong></li>
          <li>→ Cada compra dispara el pixel en el browser <strong style={{ color: "rgba(255,255,255,0.7)" }}>y</strong> desde el servidor (CAPI/Events API)</li>
          <li>→ Deduplicación via <code style={{ color }}>event_id</code> — el evento nunca se cuenta doble</li>
          <li>→ iOS 14, Safari e adblockers <strong style={{ color: "rgba(255,255,255,0.7)" }}>no pueden bloquear</strong> el evento server-side</li>
        </ul>
      </div>
    </div>
  );
}
