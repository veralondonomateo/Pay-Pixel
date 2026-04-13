import Link from "next/link";
import ROICalculator from "@/components/landing/ROICalculator";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" opacity=".4"/>
                <rect x="3.5" y="3.5" width="2" height="2" rx=".5"/>
                <rect x="10.5" y="3.5" width="2" height="2" rx=".5"/>
                <rect x="3.5" y="10.5" width="2" height="2" rx=".5"/>
                <rect x="10.5" y="10.5" width="2" height="2" rx=".5"/>
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight">PayPixel</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Calculadora</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
            <Link href="/demo/dashboard" className="hover:text-white transition-colors">Demo</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
              Ingresar
            </Link>
            <Link href="/register"
              className="text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors">
              Empezar gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-32 px-6">
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-purple-600/15 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-indigo-300 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Gratis hasta 100 pedidos/mes · Sin tarjeta de crédito
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            El checkout que<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              no rompe tu pixel
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            PayPixel es tu checkout en tu propio dominio — el <code className="text-indigo-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">_fbp</code> y{" "}
            <code className="text-indigo-300 bg-white/5 px-1.5 py-0.5 rounded text-sm">ttclid</code> nunca se pierden.
            Browser + server-side CAPI. Upsells. WhatsApp recovery. Sin comisiones de Shopify.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-base transition-colors shadow-lg shadow-indigo-500/20">
              Crear mi checkout gratis →
            </Link>
            <Link href="/demo/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl text-base transition-colors">
              Ver demo del dashboard
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-gray-600">
            Checkout propio · MercadoPago · Meta CAPI · TikTok Events API · WhatsApp Recovery
          </p>
        </div>

        {/* Dashboard preview */}
        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" style={{ top: "60%" }} />
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#111118] shadow-2xl shadow-black/50">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0d0d14] border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 mx-4 bg-white/5 rounded-md text-xs text-gray-600 px-3 py-1 text-center">
                app.paypixel.com/dashboard
              </div>
            </div>
            {/* Dashboard preview content */}
            <div className="flex h-[380px]">
              {/* Sidebar */}
              <div className="w-48 border-r border-white/5 p-3 flex-shrink-0">
                <div className="flex items-center gap-2 px-2 py-2 mb-4">
                  <div className="w-6 h-6 rounded bg-indigo-500 flex-shrink-0" />
                  <div className="h-2 bg-white/10 rounded w-20" />
                </div>
                {["Resumen", "Pedidos", "Píxeles", "Recuperación", "Configuración"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 ${i === 0 ? "bg-indigo-500/20" : ""}`}>
                    <div className={`w-3.5 h-3.5 rounded-sm ${i === 0 ? "bg-indigo-400" : "bg-white/10"}`} />
                    <span className={`text-xs ${i === 0 ? "text-indigo-300" : "text-gray-600"}`}>{item}</span>
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-5 overflow-hidden">
                <div className="mb-4">
                  <div className="h-5 bg-white/10 rounded w-24 mb-1" />
                  <div className="h-3 bg-white/5 rounded w-32" />
                </div>
                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Pedidos", val: "247", color: "text-indigo-400" },
                    { label: "Revenue", val: "$44.4M", color: "text-green-400" },
                    { label: "AOV", val: "$180K", color: "text-purple-400" },
                    { label: "Recuperados", val: "28", color: "text-orange-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/3 border border-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-gray-600 mb-1">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
                {/* Fake table rows */}
                <div className="space-y-1.5">
                  {[
                    { name: "María García", method: "MP", status: "Aprobado", amount: "$185.000" },
                    { name: "Carlos López", method: "COD", status: "Pendiente", amount: "$220.000" },
                    { name: "Ana Martínez", method: "MP", status: "Aprobado", amount: "$160.000" },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center gap-3 bg-white/3 rounded-lg px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
                      <span className="text-xs text-gray-400 flex-1">{row.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${row.method === "MP" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}`}>{row.method}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${row.status === "Aprobado" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>{row.status}</span>
                      <span className="text-xs font-semibold text-white">{row.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "35%", label: "de compras perdidas sin CAPI" },
            { value: "1%", label: "comisión Shopify eliminada" },
            { value: "17%", label: "tasa de recuperación WhatsApp" },
            { value: "2x", label: "mejor ROAS con atribución completa" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="py-24 px-6" id="como-funciona">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">El problema</p>
            <h2 className="text-4xl font-bold">El checkout de Shopify rompe todo</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
              Cuando tu cliente hace clic en "Comprar", Shopify lo lleva a{" "}
              <span className="text-red-400 font-mono text-sm">checkout.shopify.com</span>{" "}
              — un dominio completamente diferente. Las cookies desaparecen. Tu ROAS se desploma.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-16">
            {/* Without PayPixel */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-400">Sin PayPixel</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: "✗", text: "checkout.shopify.com rompe _fbp y ttclid" },
                  { icon: "✗", text: "35% de compras no se atribuyen a Meta" },
                  { icon: "✗", text: "1% de comisión por cada pago con MercadoPago" },
                  { icon: "✗", text: "Sin upsells post-compra" },
                  { icon: "✗", text: "Sin recuperación por WhatsApp" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="text-red-500 flex-shrink-0 font-bold">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* With PayPixel */}
            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-green-400">Con PayPixel</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: "✓", text: "Checkout en tu dominio → cookies intactas" },
                  { icon: "✓", text: "Browser pixel + server-side CAPI/Events API" },
                  { icon: "✓", text: "Cero comisión de Shopify (creamos la orden via API)" },
                  { icon: "✓", text: "Upsell post-compra configurable" },
                  { icon: "✓", text: "WhatsApp recovery: 30min, 2h, 24h, 72h" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-green-400 flex-shrink-0 font-bold">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pixel attribution flow */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-center mb-8">Cómo funciona la atribución doble</h3>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
              {[
                { icon: "👤", label: "Cliente compra", sub: "en tu dominio" },
                { icon: "→", label: "", sub: "", arrow: true },
                { icon: "🍪", label: "Cookies preservadas", sub: "_fbp · _fbc · ttclid · _ttp" },
                { icon: "→", label: "", sub: "", arrow: true },
                { icon: "🌐", label: "Browser Pixel", sub: "PageView → Purchase" },
                { icon: "+", label: "", sub: "", arrow: true },
                { icon: "⚡", label: "Server CAPI", sub: "iOS 14 · AdBlockers resueltos" },
              ].map((step, i) => (
                step.arrow ? (
                  <div key={i} className="text-gray-600 text-xl font-light hidden md:block">{step.icon}</div>
                ) : (
                  <div key={i} className="text-center flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-2 mx-auto">
                      {step.icon}
                    </div>
                    <p className="text-xs font-semibold text-white">{step.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{step.sub}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-4xl font-bold">Todo lo que necesitas para crecer</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Atribución preservada",
                desc: "El checkout corre en tu dominio. El _fbp y ttclid de Meta y TikTok nunca se rompen.",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Server-side events",
                desc: "Meta CAPI + TikTok Events API. Ningún adblocker ni iOS puede bloquear el evento.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Sin comisión Shopify",
                desc: "Creamos la orden directamente via Shopify API. Cero % de comisión por transacción externa.",
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Upsells post-compra",
                desc: "Ofrece un producto adicional después del pago. Un clic para añadirlo a la orden existente.",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: "WhatsApp recovery",
                desc: "Secuencia automática: 30 min, 2h, 24h, 72h. Con el link directo para retomar el carrito.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                title: "White-label total",
                desc: "Tu logo, tus colores. El cliente nunca sale de tu marca. Hasta en la URL.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
            ].map((feature) => (
              <div key={feature.title}
                className="group bg-white/3 hover:bg-white/5 border border-white/8 hover:border-white/15 rounded-2xl p-6 transition-all duration-200">
                <div className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="py-24 px-6" id="calculadora">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Calculadora de ROI</p>
            <h2 className="text-4xl font-bold">¿Cuánto revenue extra puedes generar?</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Ajusta los valores de tu marca y ve el impacto real en tu revenue mensual.
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Integración</p>
            <h2 className="text-4xl font-bold">Listo en 15 minutos</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Crea tu cuenta",
                desc: "Regístrate con tu email y el nombre de tu marca. Sin tarjeta de crédito.",
                time: "2 min",
              },
              {
                step: "02",
                title: "Conecta Shopify y MercadoPago",
                desc: "Ingresa tu access token de Shopify (Custom App) y tu token de MercadoPago.",
                time: "5 min",
              },
              {
                step: "03",
                title: "Añade tus píxeles",
                desc: "Meta Pixel ID + Conversions API Token. TikTok Pixel ID + Events API Token. PayPixel los usa server-side.",
                time: "5 min",
              },
              {
                step: "04",
                title: "Comparte tu URL de checkout",
                desc: "Tu checkout ya está en paypixel.com/checkout/tu-marca. Comparte el link o úsalo en tus ads.",
                time: "Listo",
              },
            ].map((step, i) => (
              <div key={step.step}
                className="flex gap-6 items-start p-6 bg-white/3 border border-white/8 rounded-2xl hover:border-white/15 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-400">{step.step}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-semibold text-white text-sm">{step.title}</h3>
                    <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full border border-white/8">{step.time}</span>
                  </div>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-6" id="precios">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">Precios</p>
            <h2 className="text-4xl font-bold">Simple. Sin sorpresas.</h2>
            <p className="text-gray-400 mt-4">Solo pagas cuando vendes más de 100 pedidos al mes.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Gratis</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500 text-sm">/mes</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Hasta 100 pedidos/mes</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Checkout en tu dominio",
                  "Meta CAPI + TikTok Events API",
                  "Upsells post-compra",
                  "Dashboard de pedidos",
                  "Sin tarjeta de crédito",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="block w-full text-center py-3 border border-white/15 hover:bg-white/5 text-white rounded-xl text-sm font-semibold transition-colors">
                Empezar gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 rounded-2xl p-8 relative">
              <div className="absolute top-4 right-4 text-[10px] font-bold bg-indigo-500 text-white px-2.5 py-1 rounded-full">
                MÁS POPULAR
              </div>
              <div className="mb-6">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">Escala</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$1.500</span>
                  <span className="text-gray-400 text-sm">COP/pedido adicional</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Solo sobre los que superen 100/mes</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Todo del plan Gratis",
                  "WhatsApp recovery activado",
                  "Recuperación de carritos por email",
                  "Acceso a métricas avanzadas",
                  "Soporte prioritario",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="block w-full text-center py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                Empezar gratis →
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">
            ¿Tienes más de 5.000 pedidos/mes? <a href="mailto:hola@paypixel.com" className="text-indigo-400 hover:text-indigo-300">Hablemos de un plan personalizado →</a>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "¿PayPixel reemplaza mi tienda Shopify?",
                a: "No. PayPixel es solo el checkout y la capa de pixels. Tu catálogo, inventario y gestión sigue en Shopify. Nosotros creamos la orden en Shopify via API después de cada compra."
              },
              {
                q: "¿Por qué pierde atribución el checkout de Shopify?",
                a: "Shopify procesa el pago en checkout.shopify.com — un dominio diferente al tuyo. Las cookies de primera parte (_fbp, ttclid) no se transfieren entre dominios, rompiendo la atribución en Meta y TikTok."
              },
              {
                q: "¿Qué necesito para configurarlo?",
                a: "Un access token de Shopify (Custom App con permisos de órdenes), tu access token de MercadoPago, y opcionalmente tus Pixel IDs y tokens de CAPI/Events API de Meta y TikTok."
              },
              {
                q: "¿Cómo funciona el cobro?",
                a: "Los primeros 100 pedidos al mes son gratis. Después, $1.500 COP por cada pedido adicional. El sistema calcula automáticamente al cierre de cada mes."
              },
              {
                q: "¿Los datos de mis clientes están seguros?",
                a: "Todos los tokens y credenciales se almacenan cifrados con AES-256-GCM. Los datos de clientes se guardan en tu propia base de datos, aislada por brand_id con Row Level Security en Supabase."
              },
            ].map((faq) => (
              <details key={faq.q}
                className="group bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0 group-open:rotate-45 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-12">
              <h2 className="text-4xl font-bold mb-4">
                Empieza hoy, gratis
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Sin tarjeta de crédito. Sin setup fees. Tu primer checkout
                listo en 15 minutos.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-base transition-colors shadow-lg shadow-indigo-500/20">
                Crear mi cuenta gratis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-xs text-gray-600 mt-4">100 pedidos gratis · Sin contrato · Cancela cuando quieras</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-indigo-400 text-xs font-bold">P</span>
            </div>
            <span className="text-sm text-gray-500">PayPixel</span>
          </div>
          <p className="text-xs text-gray-600">
            Hecho para marcas DTC en Colombia y LATAM · © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <Link href="/login" className="hover:text-gray-400 transition-colors">Ingresar</Link>
            <Link href="/register" className="hover:text-gray-400 transition-colors">Registro</Link>
            <Link href="/demo/dashboard" className="hover:text-gray-400 transition-colors">Demo</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
