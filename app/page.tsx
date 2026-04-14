import Link from "next/link";
import Image from "next/image";
import ROICalculator from "@/components/landing/ROICalculator";
import AnimatedCounter from "@/components/landing/AnimatedCounter";
import HeroCube from "@/components/landing/HeroCube";
import LandingNav from "@/components/landing/LandingNav";

/* ── SVG icons ── */
function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconServer({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25v-.75m19.5-9.75v.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25v-.75m19.5 0V6a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6v1.5" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function IconCurrency({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconMessage({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function IconPalette({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconArrow({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-12 pb-0">
        {/* Fine dot grid */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
        {/* Tech grid overlay */}
        <div className="absolute inset-0 tech-grid pointer-events-none" />

        {/* Radial glow top-right */}
        <div className="absolute top-0 right-0 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] pointer-events-none"
          style={{ background: "radial-gradient(circle at 70% 40%, rgba(99,102,241,0.07) 0%, transparent 65%)" }} />

        {/* Mobile: centered glow blob */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[280px] h-[280px] pointer-events-none md:hidden"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />

        {/* Top center line glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:min-h-[520px]">

            {/* ── Left: text ── */}
            <div className="py-8 sm:py-10 lg:py-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white/45 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 animate-fade-in-up-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping-soft absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                </span>
                Gratis hasta 100 pedidos · Sin tarjeta
              </div>

              <h1 className="text-[40px] sm:text-[56px] lg:text-[76px] font-bold tracking-[-0.03em] leading-[0.95] mb-5 text-white animate-fade-in-up-2">
                El checkout<br />
                que te permite<br />
                <span className="gradient-text">escalar.</span>
              </h1>

              <div className="max-w-md mb-8 animate-fade-in-up-3 space-y-2">
                <p className="text-[14px] sm:text-[15px] text-white/40 leading-snug">
                  Meta no te deja escalar porque no ve hasta el 35% de tus ventas.<br className="hidden sm:inline" />
                  Pierdes millones en carritos abandonados y Shopify te cobra 2% por pago.
                </p>
                <p className="text-[14px] sm:text-[15px] text-white/80 font-medium leading-snug">
                  PayPixel recupera ventas, aumenta tu AOV y te muestra tu ROAS real — sin tocar tu tienda.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up-4">
                <Link href="/register"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-black font-semibold rounded-xl text-[14px] transition-all duration-200 hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.18)]">
                  Crear checkout gratis →
                </Link>
                <Link href="/demo/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.07] text-white/70 font-semibold rounded-xl text-[14px] transition-all duration-200">
                  Ver demo
                </Link>
              </div>

              {/* Mobile trust line */}
              <p className="mt-4 text-xs text-white/20 animate-fade-in-up-4 sm:hidden">
                Sin tarjeta · Setup 15 min · Cancela cuando quieras
              </p>
            </div>

            {/* ── Right: 3D cube — visible md+ ── */}
            <div className="hidden md:flex items-center justify-center h-[480px] lg:h-[620px] relative">
              <HeroCube />
            </div>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="relative mt-8 sm:mt-10 overflow-hidden border-t border-white/[0.05] py-3">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap">
            {[
              "Meta CAPI", "TikTok Events API", "MercadoPago", "WhatsApp Recovery",
              "Shopify API", "Upsells Post-Compra", "Atribución Completa", "Sin Comisiones",
              "Meta CAPI", "TikTok Events API", "MercadoPago", "WhatsApp Recovery",
              "Shopify API", "Upsells Post-Compra", "Atribución Completa", "Sin Comisiones",
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 mx-5 sm:mx-6 text-[10px] sm:text-[11px] text-white/20 uppercase tracking-widest">
                <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Integration logos strip */}
        <div className="max-w-5xl mx-auto py-10 sm:py-14 border-b border-white/[0.05]">
          <p className="text-center text-sm font-semibold text-white/70 mb-2">
            Integra con las herramientas que ya usas
          </p>
          <p className="text-center text-[12px] sm:text-[13px] text-white/30 mb-8 sm:mb-10">
            Conecta tu stack existente sin cambiar nada
          </p>
          {/* Mobile: 3-col grid / Desktop: single flex row */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:items-end sm:justify-center gap-6 sm:gap-10">
            {[
              { src: "/shopify-logo.png",      alt: "Shopify",     label: "Tu tienda",     w: 112, h: 32, invert: false },
              { src: "/mercadopago-logo.webp", alt: "MercadoPago", label: "Pagos",         w: 136, h: 32, invert: false },
              { src: "/meta-logo.png",         alt: "Meta",        label: "Pixel de Meta", w: 96,  h: 28, invert: false },
              { src: "/tiktok-logo.webp",      alt: "TikTok",      label: "Events API",    w: 104, h: 28, invert: false },
              { src: "/whatsapp-logo.png",     alt: "WhatsApp",    label: "Recovery",      w: 112, h: 30, invert: false },
              { src: "/supabase-logo.png",     alt: "Supabase",    label: "Base de datos", w: 112, h: 28, invert: true  },
            ].map((logo) => (
              <div key={logo.alt}
                className="flex flex-col items-center gap-2 sm:gap-3 opacity-45 hover:opacity-80 transition-opacity duration-200 cursor-default sm:w-[110px]">
                <div className="h-7 sm:h-9 flex items-center justify-center">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.w}
                    height={logo.h}
                    className="object-contain max-h-7 sm:max-h-9 w-auto"
                    style={logo.invert ? { filter: "invert(1)" } : undefined}
                  />
                </div>
                <span className="text-[10px] text-white/35 text-center leading-tight">{logo.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview — hidden on very small screens */}
        <div className="relative max-w-5xl mx-auto pt-12 sm:pt-16 pb-0 hidden sm:block">
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-48 bg-gradient-to-t from-[#080808] to-transparent z-10 pointer-events-none" />

          <p className="text-center text-[10px] sm:text-[11px] text-white/25 uppercase tracking-[0.2em] mb-6 sm:mb-8">
            Dashboard en tiempo real
          </p>

          <div className="relative rounded-xl border border-white/[0.07] overflow-hidden bg-[#0c0c0c] shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0a0a0a] border-b border-white/[0.05]">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/[0.07]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/[0.07]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/[0.07]" />
              </div>
              <div className="flex-1 mx-2 sm:mx-4 bg-white/[0.04] rounded text-[10px] sm:text-[11px] text-white/20 px-2 sm:px-3 py-1 text-center font-mono truncate">
                app.paypixel.com/dashboard
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                </span>
                <span className="text-[9px] sm:text-[10px] text-white/20 hidden sm:inline">live</span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="flex h-[320px] sm:h-[400px]">
              {/* Sidebar — hidden on small */}
              <div className="hidden sm:block w-44 border-r border-white/[0.04] p-3 flex-shrink-0">
                <div className="flex items-center gap-2 px-2 py-2 mb-5">
                  <Image src="/Frame 1984079435.png" alt="PayPixel" width={20} height={20} className="rounded flex-shrink-0 ring-1 ring-white/10" />
                  <div className="h-2 bg-white/[0.07] rounded w-16" />
                </div>
                {[
                  { label: "Resumen", active: true },
                  { label: "Pedidos", active: false },
                  { label: "Píxeles", active: false },
                  { label: "Recuperación", active: false },
                  { label: "Configuración", active: false },
                ].map((item) => (
                  <div key={item.label}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-md mb-0.5 ${item.active ? "bg-white/[0.06]" : ""}`}>
                    <div className={`w-1 h-3 rounded-full ${item.active ? "bg-white/60" : "bg-white/[0.08]"}`} />
                    <span className={`text-xs ${item.active ? "text-white/70 font-medium" : "text-white/20"}`}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className="flex-1 p-4 sm:p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <p className="text-sm font-semibold text-white/80 mb-0.5">Resumen</p>
                    <p className="text-xs text-white/25">Abril 2026</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/[0.15] px-2.5 py-1 rounded-full">
                    <span className="relative flex h-1 w-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-400" />
                    </span>
                    En vivo
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
                  {[
                    { label: "Pedidos", val: "247", delta: "+12%" },
                    { label: "Revenue", val: "$44.4M", delta: "+8%" },
                    { label: "AOV", val: "$180K", delta: "+3%" },
                    { label: "Recuperados", val: "28", delta: "+5%" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-2.5 sm:p-3">
                      <p className="text-[8px] sm:text-[9px] text-white/25 mb-1 sm:mb-1.5 uppercase tracking-wider">{s.label}</p>
                      <p className="text-xs sm:text-sm font-bold text-white">{s.val}</p>
                      <p className="text-[8px] sm:text-[9px] text-emerald-500 mt-0.5">{s.delta}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {[
                    { name: "María García", method: "MP", status: "Aprobado", amount: "$185.000", highlight: true },
                    { name: "Carlos López", method: "COD", status: "Pendiente", amount: "$220.000", highlight: false },
                    { name: "Ana Martínez", method: "MP", status: "Aprobado", amount: "$160.000", highlight: false },
                  ].map((row) => (
                    <div key={row.name}
                      className={`flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 ${row.highlight ? "animate-row-pulse border border-white/[0.08]" : "bg-white/[0.02] border border-transparent"}`}>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/[0.08] flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs text-white/50 flex-1 truncate">{row.name}</span>
                      <span className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium bg-white/[0.07] text-white/50 hidden sm:inline">{row.method}</span>
                      <span className={`text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${row.status === "Aprobado" ? "text-emerald-400 bg-emerald-500/[0.1]" : "text-amber-400 bg-amber-500/[0.1]"}`}>{row.status}</span>
                      <span className="text-[11px] sm:text-xs font-semibold text-white/80 tabular-nums flex-shrink-0">{row.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/[0.05] py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {[
            { end: 35, suffix: "%", label: "compras perdidas sin CAPI" },
            { end: 2,  suffix: "%", label: "comisión Shopify eliminada" },
            { end: 17, suffix: "%", label: "tasa de recuperación WhatsApp" },
            { end: 2,  suffix: "x", label: "mejor ROAS con atribución" },
          ].map((s) => (
            <div key={s.label} className="text-center px-3 sm:px-4 py-5 sm:py-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-colors">
              <p className="text-4xl sm:text-5xl font-black mb-2 tabular-nums tracking-tight text-white">
                <AnimatedCounter end={s.end} suffix={s.suffix} duration={1800} />
              </p>
              <p className="text-[10px] sm:text-[11px] text-white/25 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6" id="como-funciona">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-[0.18em] mb-4">El problema</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">El checkout de Shopify rompe todo</h2>
            <p className="text-white/30 max-w-xl mx-auto leading-relaxed text-[14px] sm:text-[15px]">
              Cada vez que un cliente compra, Shopify lo lleva a{" "}
              <code className="text-red-400 font-mono text-[12px] sm:text-[13px] bg-red-500/[0.08] px-1.5 py-0.5 rounded">checkout.shopify.com</code>.
              {" "}Las cookies desaparecen. El pixel no ve la conversión. Tu ROAS se desploma.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 mb-10 sm:mb-16">
            {/* Without */}
            <div className="bg-red-500/[0.03] border border-red-500/[0.12] rounded-2xl p-5 sm:p-7">
              <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
                <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-red-400">Sin PayPixel</span>
              </div>
              <div className="space-y-4 sm:space-y-5">
                {[
                  { text: "checkout.shopify.com rompe _fbp y ttclid", impact: "Cookies de primera parte destruidas" },
                  { text: "35% de compras no se atribuyen a Meta", impact: "Tu ROAS reportado está subvalorado" },
                  { text: "2% de comisión Shopify por cada pago con MercadoPago", impact: "En 500 pedidos de $200K = $2.000.000 perdidos" },
                  { text: "Sin recuperación de carritos abandonados", impact: "28% de clientes que casi compraron, se fueron" },
                  { text: "Sin upsells — dinero en la mesa sin tocar", impact: "0% de incremento en ticket promedio" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <IconX className="w-4 h-4 text-red-500/60 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] sm:text-sm text-white/50">{item.text}</p>
                      <p className="text-xs text-red-400/60 mt-0.5">{item.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* With */}
            <div className="bg-emerald-500/[0.03] border border-emerald-500/[0.12] rounded-2xl p-5 sm:p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.05] blur-3xl rounded-full pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">Con PayPixel</span>
                </div>
                <div className="space-y-4 sm:space-y-5">
                  {[
                    { text: "Checkout en tu dominio — cookies intactas", impact: "_fbp, _fbc, ttclid, _ttp nunca se pierden" },
                    { text: "Browser pixel + server-side CAPI / Events API", impact: "100% de eventos llegan a Meta y TikTok" },
                    { text: "Cero comisión Shopify — orden via API directa", impact: "$0 de fee. El dinero es tuyo." },
                    { text: "WhatsApp + Email recovery automático", impact: "Secuencia: 30min · 2h · 24h · 72h — recupera el 17%" },
                    { text: "Upsell post-compra con 1 clic", impact: "+30% de ticket en los clientes que aceptan" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <IconCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] sm:text-sm text-white/80">{item.text}</p>
                        <p className="text-xs text-emerald-400/70 mt-0.5">{item.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Attribution flow */}
          <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 sm:p-10">
            <h3 className="text-sm font-semibold text-center mb-8 sm:mb-10 text-gray-300 uppercase tracking-widest">
              Cómo funciona la atribución doble
            </h3>

            {/* Mobile: vertical stack / Desktop: horizontal row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 justify-center">
              {[
                { icon: <IconUser className="w-5 h-5" />, label: "Cliente compra", sub: "en tu dominio", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                null,
                { icon: <IconShield className="w-5 h-5" />, label: "Cookies preservadas", sub: "_fbp · _fbc · ttclid · _ttp", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
                null,
                { icon: <IconGlobe className="w-5 h-5" />, label: "Browser Pixel", sub: "PageView → Purchase", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                null,
                { icon: <IconBolt className="w-5 h-5" />, label: "Server CAPI", sub: "iOS 14 · AdBlockers resueltos", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              ].map((step, i) =>
                step === null ? (
                  <div key={i} className="flex items-center">
                    {/* Vertical on mobile, horizontal on desktop */}
                    <svg className="w-4 h-4 text-gray-700 sm:hidden rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    <IconArrow className="w-4 h-4 text-gray-700 hidden sm:block" />
                  </div>
                ) : (
                  <div key={i} className="text-center flex-shrink-0 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center ${step.color} sm:mb-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] flex-shrink-0`}>
                      {step.icon}
                    </div>
                    <div className="text-left sm:text-center">
                      <p className="text-xs font-semibold text-white sm:mb-0.5">{step.label}</p>
                      <p className="text-[10px] text-gray-600">{step.sub}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-[0.18em] mb-4">Funcionalidades</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Todo lo que necesitas para crecer</h2>
            <p className="text-white/30 text-[14px] sm:text-[15px] mt-4 max-w-xl mx-auto">Una sola plataforma reemplaza Shopify Checkout, un ESP y una herramienta de recuperación.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
            {[
              {
                icon: <IconShield className="w-5 h-5" />,
                title: "Atribución preservada",
                desc: "El checkout corre en tu dominio. _fbp y ttclid de Meta y TikTok nunca se rompen.",
                color: "text-indigo-400",
                dot: "bg-indigo-400",
              },
              {
                icon: <IconServer className="w-5 h-5" />,
                title: "Server-side events",
                desc: "Meta CAPI + TikTok Events API. Ningún adblocker ni iOS puede bloquear el evento.",
                color: "text-blue-400",
                dot: "bg-blue-400",
              },
              {
                icon: <IconCurrency className="w-5 h-5" />,
                title: "Sin comisión Shopify",
                desc: "Orden via Shopify API directa. Cero % de comisión por transacción externa.",
                color: "text-emerald-400",
                dot: "bg-emerald-400",
              },
              {
                icon: <IconBolt className="w-5 h-5" />,
                title: "Upsells post-compra",
                desc: "Ofrece un producto extra después del pago. Un clic lo añade a la orden existente.",
                color: "text-amber-400",
                dot: "bg-amber-400",
              },
              {
                icon: <IconMessage className="w-5 h-5" />,
                title: "WhatsApp + Email recovery",
                desc: "Secuencia automática: 30min, 2h, 24h, 72h por WhatsApp y email. Recupera el 17% de carritos abandonados.",
                color: "text-green-400",
                dot: "bg-green-400",
              },
              {
                icon: <IconPalette className="w-5 h-5" />,
                title: "White-label total",
                desc: "Tu logo, tus colores, tu URL. El cliente nunca sale de tu marca.",
                color: "text-purple-400",
                dot: "bg-purple-400",
              },
            ].map((feature) => (
              <div key={feature.title}
                className="group bg-[#080808] hover:bg-white/[0.03] transition-colors duration-200 p-6 sm:p-7">
                <div className={`flex items-center gap-2 mb-4 ${feature.color}`}>
                  {feature.icon}
                  <span className={`w-1.5 h-1.5 rounded-full ${feature.dot} ml-auto opacity-50 group-hover:opacity-100 transition-opacity`} />
                </div>
                <h3 className="font-semibold text-white mb-2 text-[14px] tracking-tight">{feature.title}</h3>
                <p className="text-[13px] text-white/30 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hell Yes Offer ── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08]"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.04) 50%, rgba(168,85,247,0.08) 100%)" }}>

            <div className="absolute inset-0 tech-grid opacity-50 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-1 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)" }} />

            <div className="relative px-6 sm:px-8 py-10 sm:py-14 text-center">
              <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-[0.2em] mb-5">La oferta</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-tight">
                Empieza gratis.<br />
                <span className="gradient-text">Escala cuando vendas más.</span>
              </h2>
              <p className="text-white/40 text-[14px] sm:text-[16px] max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                100 pedidos gratis al mes, para siempre. Sin tarjeta de crédito. Setup en 15 minutos.
                Si no recuperas más de lo que pagas en el primer mes, te devolvemos el dinero.
              </p>

              {/* Value props */}
              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10 max-w-2xl mx-auto text-left">
                {[
                  { title: "Gratis hasta 100 pedidos", desc: "Sin límite de tiempo. Para siempre.", icon: "✦" },
                  { title: "ROI desde el día 1", desc: "Recuperas comisiones + carritos desde el primer mes.", icon: "✦" },
                  { title: "Garantía de devolución", desc: "Si no ves resultados en 30 días, te regresamos el pago.", icon: "✦" },
                ].map((v) => (
                  <div key={v.title} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
                    <span className="text-indigo-400 text-xs mb-2 block">{v.icon}</span>
                    <p className="text-sm font-semibold text-white mb-1">{v.title}</p>
                    <p className="text-xs text-white/35 leading-snug">{v.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 bg-white text-black font-bold rounded-xl text-[15px] transition-all duration-200 hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.12)]">
                  Crear mi checkout gratis →
                </Link>
                <Link href="/demo/dashboard"
                  className="text-[14px] text-white/40 hover:text-white/70 transition-colors px-4 py-3.5">
                  Ver demo primero
                </Link>
              </div>

              <p className="text-xs text-white/20 mt-4 sm:mt-5">Sin tarjeta · Setup en 15 min · Cancela cuando quieras</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6" id="calculadora">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-[0.18em] mb-4">Calculadora de ROI</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Cuánto revenue extra puedes generar?</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-[14px] sm:text-base">
              Ajusta los valores de tu marca y ve el impacto real en tu revenue mensual.
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-[0.18em] mb-4">Integración</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Listo en 15 minutos</h2>
            <p className="text-white/30 mt-4 text-[14px] sm:text-[15px]">Sin código. Sin DevOps. Solo conecta y listo.</p>
          </div>

          <div className="space-y-3">
            {[
              { step: "01", title: "Crea tu cuenta", desc: "Email + nombre de marca. Sin tarjeta de crédito.", time: "2 min" },
              { step: "02", title: "Conecta Shopify y MercadoPago", desc: "Access token de Shopify (Custom App) + token de MercadoPago.", time: "5 min" },
              { step: "03", title: "Añade tus píxeles", desc: "Meta Pixel ID + CAPI Token · TikTok Pixel ID + Events API Token.", time: "5 min" },
              { step: "04", title: "Comparte tu checkout", desc: "paypixel.com/checkout/tu-marca está listo. Úsalo en tus ads.", time: "Listo" },
            ].map((step) => (
              <div key={step.step}
                className="group flex gap-4 sm:gap-5 items-start p-4 sm:p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all duration-200">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-500/[0.1] border border-indigo-500/[0.2] flex items-center justify-center mt-0.5">
                  <span className="text-[11px] font-bold text-indigo-400 tabular-nums">{step.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-1">
                    <h3 className="font-semibold text-white text-[14px]">{step.title}</h3>
                    <span className="text-[10px] text-indigo-400/70 bg-indigo-500/[0.08] px-2 py-0.5 rounded-full border border-indigo-500/[0.15] flex-shrink-0">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-[13px] text-white/30 leading-relaxed">{step.desc}</p>
                </div>
                <svg className="w-4 h-4 text-white/10 group-hover:text-white/25 transition-colors flex-shrink-0 mt-2.5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6" id="precios">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-[0.18em] mb-4">Precios</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple. Sin sorpresas.</h2>
            <p className="text-gray-500">Elige el plan que mejor se adapte al volumen de tu marca.</p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Gratis */}
            <div className="lift-card bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 sm:p-7 flex flex-col animate-slide-up" style={{ animationDelay: "0s" }}>
              <div className="mb-6">
                <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest mb-4">Gratis</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-600 text-sm">/mes</span>
                </div>
                <p className="text-xs text-gray-600">Hasta 100 pedidos/mes</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Checkout en tu dominio",
                  "Meta CAPI + TikTok Events",
                  "Upsells post-compra",
                  "Dashboard de pedidos",
                  "Sin tarjeta de crédito",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-gray-500">
                    <IconCheck className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="block w-full text-center py-3 border border-white/[0.1] hover:bg-white/[0.05] hover:border-white/[0.18] text-white rounded-xl text-sm font-semibold transition-all duration-200">
                Empezar gratis
              </Link>
            </div>

            {/* Starter */}
            <div className="lift-card bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 sm:p-7 flex flex-col animate-slide-up" style={{ animationDelay: "0.07s" }}>
              <div className="mb-6">
                <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest mb-4">Starter</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl font-bold">$40.000</span>
                </div>
                <p className="text-xs text-gray-500 mb-0.5">COP/mes · $9.99 USD</p>
                <p className="text-xs text-gray-600">100–500 pedidos/mes</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Todo del plan Gratis",
                  "WhatsApp recovery",
                  "Recuperación por email",
                  "Soporte estándar",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-gray-500">
                    <IconCheck className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="block w-full text-center py-3 border border-white/[0.1] hover:bg-white/[0.05] hover:border-white/[0.18] text-white rounded-xl text-sm font-semibold transition-all duration-200">
                Comenzar →
              </Link>
            </div>

            {/* Growth — popular */}
            <div className="gradient-border-wrap animate-slide-up flex flex-col" style={{ animationDelay: "0.14s" }}>
              <div className="bg-[#030308] rounded-[17px] p-6 sm:p-7 flex flex-col h-full relative">
                <div className="absolute top-4 right-4 text-[9px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full tracking-wide">
                  POPULAR
                </div>
                <div className="mb-6">
                  <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mb-4">Growth</p>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-4xl font-bold">$79.900</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-0.5">COP/mes · $19.99 USD</p>
                  <p className="text-xs text-gray-400">500–2.000 pedidos/mes</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {[
                    "Todo del plan Starter",
                    "Métricas avanzadas",
                    "Descuentos en recovery",
                    "Multi-píxel por producto",
                    "Soporte prioritario",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-gray-400">
                      <IconCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className="block w-full text-center py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)]">
                  Comenzar →
                </Link>
              </div>
            </div>

            {/* Scale */}
            <div className="lift-card bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 sm:p-7 flex flex-col animate-slide-up" style={{ animationDelay: "0.21s" }}>
              <div className="mb-6">
                <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest mb-4">Scale</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl font-bold">$159.000</span>
                </div>
                <p className="text-xs text-gray-500 mb-0.5">COP/mes · $39.99 USD</p>
                <p className="text-xs text-gray-600">+2.000 pedidos/mes</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Todo del plan Growth",
                  "SLA de uptime garantizado",
                  "Manager dedicado",
                  "Integraciones personalizadas",
                  "Factura electrónica",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-gray-500">
                    <IconCheck className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="block w-full text-center py-3 border border-white/[0.1] hover:bg-white/[0.05] hover:border-white/[0.18] text-white rounded-xl text-sm font-semibold transition-all duration-200">
                Comenzar →
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-700 mt-8">
            Volumen enterprise o necesidades especiales?{" "}
            <a href="mailto:hola@paypixel.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Hablemos de un plan personalizado →
            </a>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
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
                className="group bg-white/[0.025] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.12] transition-colors">
                <summary className="flex items-center justify-between gap-4 px-4 sm:px-5 py-4 cursor-pointer">
                  <span className="text-[13px] sm:text-sm font-medium text-white">{faq.q}</span>
                  <svg
                    className="w-4 h-4 text-gray-600 flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </summary>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-[13px] sm:text-sm text-gray-500 leading-relaxed border-t border-white/[0.05] pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600/[0.12] blur-[80px] rounded-full pointer-events-none animate-glow-pulse" />
            <div className="relative bg-gradient-to-br from-white/[0.04] to-white/[0.015] border border-white/[0.1] rounded-2xl sm:rounded-3xl p-10 sm:p-14 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Empieza hoy, gratis</h2>
              <p className="text-gray-500 mb-8 sm:mb-10 leading-relaxed text-[14px] sm:text-base">
                Sin tarjeta de crédito. Sin setup fees. Tu primer checkout
                listo en 15 minutos.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-[15px] sm:text-base transition-all duration-200 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_56px_rgba(99,102,241,0.55)]">
                Crear mi cuenta gratis
                <IconArrow className="w-4 h-4" />
              </Link>
              <p className="text-xs text-gray-700 mt-4 sm:mt-5">100 pedidos gratis · Sin contrato · Cancela cuando quieras</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center">
            <Image src="/Pay Pixel-1.png" alt="PayPixel" width={80} height={16} className="object-contain opacity-35" />
          </div>
          <p className="text-xs text-gray-700">
            Hecho para marcas DTC en Colombia y LATAM · © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-5 sm:gap-6 text-xs text-gray-700">
            <Link href="/login" className="hover:text-gray-400 transition-colors">Ingresar</Link>
            <Link href="/register" className="hover:text-gray-400 transition-colors">Registro</Link>
            <Link href="/demo/dashboard" className="hover:text-gray-400 transition-colors">Demo</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
