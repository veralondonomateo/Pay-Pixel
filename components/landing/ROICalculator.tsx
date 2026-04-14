"use client";

import { useState, useMemo } from "react";

function formatCOP(n: number, compact = false): string {
  if (compact && n >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ROICalculator() {
  const [orders, setOrders] = useState(300);
  const [aov, setAov] = useState(180000);
  const [adSpend, setAdSpend] = useState(5000000);
  const [mpPercent, setMpPercent] = useState(60);

  const results = useMemo(() => {
    const monthlyRevenue = orders * aov;

    // 1. Ahorro en comisiones Shopify (2% sobre pedidos MP)
    const mpOrders = orders * (mpPercent / 100);
    const shopifyCommission = mpOrders * aov * 0.02;

    // 2. Revenue recuperado de atribución
    // Sin CAPI: ~35% de compras no se atribuyen → ROAS subvaluado
    // Con PayPixel: se recuperan esos eventos → puedes escalar pauta
    // Estimado conservador: 18% de mejora en ROAS sobre ad spend
    const attributionRecovery = adSpend * 0.18;

    // 3. Upsell post-compra
    // 20% de clientes aceptan upsell de 30% del AOV
    const upsellRevenue = orders * 0.20 * (aov * 0.30);

    // 4. Recuperación de carritos
    // 28% abandona, de esos recuperamos 17%
    const abandonedCarts = orders * 0.28;
    const recoveredCarts = abandonedCarts * 0.17;
    const cartRecovery = recoveredCarts * aov;

    const totalMonthly = shopifyCommission + attributionRecovery + upsellRevenue + cartRecovery;
    const totalAnnual = totalMonthly * 12;

    return {
      shopifyCommission,
      attributionRecovery,
      upsellRevenue,
      cartRecovery,
      totalMonthly,
      totalAnnual,
      monthlyRevenue,
      roasImprovement: 18,
    };
  }, [orders, aov, adSpend, mpPercent]);

  const upliftPercent = ((results.totalMonthly / results.monthlyRevenue) * 100).toFixed(1);

  return (
    <div className="relative">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 rounded-3xl pointer-events-none" />

      <div className="relative grid lg:grid-cols-2 gap-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 lg:p-10">

        {/* ── Inputs ── */}
        <div className="space-y-7">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Calcula tu revenue adicional</h3>
            <p className="text-sm text-gray-400">Ajusta los valores de tu marca</p>
          </div>

          {/* Pedidos/mes */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-gray-300">Pedidos al mes</label>
              <span className="text-xl font-bold text-white tabular-nums">{orders}</span>
            </div>
            <input
              type="range" min={50} max={2000} step={50}
              value={orders}
              onChange={(e) => setOrders(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6366f1 ${((orders - 50) / 1950) * 100}%, #374151 ${((orders - 50) / 1950) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>50</span><span>2,000</span>
            </div>
          </div>

          {/* AOV */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-gray-300">Ticket promedio (AOV)</label>
              <span className="text-xl font-bold text-white tabular-nums">{formatCOP(aov, true)}</span>
            </div>
            <input
              type="range" min={30000} max={800000} step={10000}
              value={aov}
              onChange={(e) => setAov(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6366f1 ${((aov - 30000) / 770000) * 100}%, #374151 ${((aov - 30000) / 770000) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>$30K</span><span>$800K</span>
            </div>
          </div>

          {/* Ad Spend */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-gray-300">Pauta mensual (Meta + TikTok)</label>
              <span className="text-xl font-bold text-white tabular-nums">{formatCOP(adSpend, true)}</span>
            </div>
            <input
              type="range" min={500000} max={50000000} step={500000}
              value={adSpend}
              onChange={(e) => setAdSpend(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6366f1 ${((adSpend - 500000) / 49500000) * 100}%, #374151 ${((adSpend - 500000) / 49500000) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>$500K</span><span>$50M</span>
            </div>
          </div>

          {/* MP % */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-gray-300">% pagan con MercadoPago</label>
              <span className="text-xl font-bold text-white tabular-nums">{mpPercent}%</span>
            </div>
            <input
              type="range" min={10} max={100} step={5}
              value={mpPercent}
              onChange={(e) => setMpPercent(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6366f1 ${mpPercent}%, #374151 ${mpPercent}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>10%</span><span>100%</span>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="space-y-5 flex flex-col">

          {/* Total highlight */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-center">
            <p className="text-indigo-200 text-sm font-medium mb-1">Revenue adicional estimado</p>
            <p className="text-4xl font-black text-white tracking-tight">
              {formatCOP(results.totalMonthly, true)}
            </p>
            <p className="text-indigo-200 text-sm mt-1">por mes · +{upliftPercent}% sobre revenue actual</p>
            <div className="mt-3 pt-3 border-t border-indigo-500">
              <p className="text-xs text-indigo-300">Anualizado: <span className="font-bold text-white">{formatCOP(results.totalAnnual, true)}</span></p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-3">
            {[
              {
                label: "Ahorro comisiones Shopify",
                value: results.shopifyCommission,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                iconColor: "text-green-400 bg-green-500/[0.12]",
                desc: "2% que Shopify cobra por cada pago con MercadoPago",
                color: "from-green-500/20 to-green-600/10",
                border: "border-green-500/20",
              },
              {
                label: "Mejora de atribución (ROAS)",
                value: results.attributionRecovery,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                ),
                iconColor: "text-blue-400 bg-blue-500/[0.12]",
                desc: `+${results.roasImprovement}% en ROAS → más presupuesto rentable`,
                color: "from-blue-500/20 to-blue-600/10",
                border: "border-blue-500/20",
              },
              {
                label: "Upsells post-compra",
                value: results.upsellRevenue,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                iconColor: "text-purple-400 bg-purple-500/[0.12]",
                desc: "20% aceptación · 30% del ticket",
                color: "from-purple-500/20 to-purple-600/10",
                border: "border-purple-500/20",
              },
              {
                label: "Recuperación de carritos",
                value: results.cartRecovery,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                ),
                iconColor: "text-orange-400 bg-orange-500/[0.12]",
                desc: "WhatsApp + email · 17% tasa de recuperación",
                color: "from-orange-500/20 to-orange-600/10",
                border: "border-orange-500/20",
              },
            ].map((item) => (
              <div key={item.label}
                className={`flex items-center gap-4 p-3.5 rounded-xl bg-gradient-to-r ${item.color} border ${item.border}`}>
                <span className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${item.iconColor}`}>{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                </div>
                <span className="text-sm font-bold text-white flex-shrink-0 tabular-nums">
                  +{formatCOP(item.value, true)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 text-center">
            Estimaciones basadas en promedios de marcas DTC similares en LATAM.
          </p>
        </div>
      </div>
    </div>
  );
}
