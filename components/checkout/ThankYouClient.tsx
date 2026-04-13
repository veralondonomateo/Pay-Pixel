"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { BrandPublic, UpsellProduct } from "@/types/tenant";
import type { CheckoutItem } from "@/types/checkout";

interface StoredOrder {
  firstName: string;
  lastName: string;
  email: string;
  items: CheckoutItem[];
  total: number;
  paymentMethod: "mercadopago" | "contraentrega";
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

function triggerFinalize(
  slug: string,
  orderId: string | null,
  ref: React.MutableRefObject<boolean>
) {
  if (!orderId || ref.current) return;
  ref.current = true;
  fetch(`/api/${slug}/checkout/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId }),
  })
    .then((res) => {
      if (!res.ok) {
        ref.current = false;
        console.error("[Finalize] HTTP", res.status);
      }
    })
    .catch((err) => {
      ref.current = false;
      console.error("[Finalize]", err);
    });
}

interface Props {
  brand: BrandPublic | null;
  slug: string;
  postPurchaseUpsells: UpsellProduct[];
}

export default function ThankYouClient({ brand, slug, postPurchaseUpsells }: Props) {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");

  const brandColor = brand?.primary_color ?? "#6366f1";
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [upsellAdded, setUpsellAdded] = useState<string | null>(null); // upsell_product_id
  const [upsellLoading, setUpsellLoading] = useState<string | null>(null);
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const finalizedRef = useRef(false);

  const isFailure = status === "failure";
  const isPending = status === "pending";
  const isContraentrega = !paymentId && !isFailure && !isPending;
  const isSuccess = !isFailure && !isPending;

  // ── Cargar datos de sesión y disparar píxeles ─────────────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem(`pp-order-${slug}`);
    if (raw) {
      try {
        const parsed: StoredOrder = JSON.parse(raw);
        setOrder(parsed);

        if (orderId && isSuccess && typeof window !== "undefined") {
          if ((window as any).fbq) {
            (window as any).fbq(
              "track",
              "Purchase",
              { value: parsed.total, currency: "COP" },
              { eventID: `purchase_${orderId}` }
            );
          }
          if ((window as any).ttq) {
            (window as any).ttq.track("CompletePayment", {
              content_id: orderId,
              content_type: "product",
              currency: "COP",
              value: parsed.total,
              quantity: parsed.items.reduce((s: number, i: CheckoutItem) => s + i.quantity, 0),
            });
          }
        }
      } catch {}
    }

    // Confirmar pago MP
    if (orderId && paymentId && status) {
      fetch(`/api/${slug}/checkout/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, payment_id: paymentId }),
      }).catch(() => {});
    }
  }, []);

  // ── Finalize para contraentrega ───────────────────────────────────────────
  useEffect(() => {
    if (!orderId || !isContraentrega) return;

    const beaconFinalize = () => {
      const payload = JSON.stringify({ order_id: orderId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `/api/${slug}/checkout/finalize`,
          new Blob([payload], { type: "application/json" })
        );
      } else {
        fetch(`/api/${slug}/checkout/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        }).catch(() => {});
      }
    };

    const timer = setTimeout(
      () => triggerFinalize(slug, orderId, finalizedRef),
      45_000
    );
    window.addEventListener("beforeunload", beaconFinalize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", beaconFinalize);
    };
  }, [orderId, isContraentrega, slug]);

  // ── Upsell post-compra ────────────────────────────────────────────────────
  const handleUpsell = async (productId: string) => {
    if (!orderId || upsellAdded || upsellLoading) return;
    setUpsellLoading(productId);
    try {
      const res = await fetch(`/api/${slug}/checkout/upsell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, upsell_product_id: productId }),
      });
      if (res.ok) {
        setUpsellAdded(productId);
        triggerFinalize(slug, orderId, finalizedRef);
      }
    } catch (err) {
      console.error("Upsell error:", err);
    } finally {
      setUpsellLoading(null);
    }
  };

  const handleDismissUpsell = () => {
    setUpsellDismissed(true);
    triggerFinalize(slug, orderId, finalizedRef);
  };

  const steps =
    order?.paymentMethod === "contraentrega"
      ? [
          { title: "Pedido recibido", desc: "Registramos tu pedido con pago contra entrega.", active: true },
          { title: "Preparando tu pedido", desc: "Nuestro equipo alista tu pedido.", active: false },
          { title: "Paga al recibir", desc: "Ten el efectivo listo cuando llegue.", active: false },
        ]
      : [
          { title: "Pago confirmado", desc: "MercadoPago procesó tu pago exitosamente.", active: true },
          { title: "Preparando tu pedido", desc: "Nuestro equipo alista tu pedido.", active: false },
          { title: "En camino", desc: "Recibirás un mensaje con el seguimiento.", active: false },
        ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href={`/checkout/${slug}`}>
            {brand?.logo_url ? (
              <Image src={brand.logo_url} alt={brand.name} width={120} height={40}
                className="h-9 w-auto object-contain" priority />
            ) : (
              <span className="text-lg font-bold text-gray-900">{brand?.name}</span>
            )}
          </Link>
          {isSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Compra segura
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* FAILURE */}
        {isFailure && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Pago rechazado</h1>
            <p className="text-gray-500 text-sm">No se pudo procesar tu pago. Puedes intentarlo de nuevo.</p>
            <Link href={`/checkout/${slug}`}
              className="inline-block mt-2 px-6 py-3 text-white text-sm font-semibold rounded-lg"
              style={{ backgroundColor: brandColor }}>
              Volver al checkout
            </Link>
          </div>
        )}

        {/* PENDING */}
        {isPending && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Pago en proceso</h1>
            <p className="text-gray-500 text-sm">Tu pago está siendo verificado. Te notificaremos cuando se confirme.</p>
            {paymentId && <p className="text-xs text-gray-400">Ref. #{paymentId}</p>}
          </div>
        )}

        {/* SUCCESS */}
        {isSuccess && (
          <div className="space-y-4">

            {/* Hero */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                ¡Gracias{order ? `, ${order.firstName}` : ""}!
              </h1>
              <p className="text-gray-500 text-sm mb-4">
                {order?.paymentMethod === "contraentrega"
                  ? "Tu pedido fue registrado. Prepara el pago en efectivo para cuando llegue."
                  : "Tu pedido fue confirmado y pronto estará en camino."}
              </p>
              {paymentId && (
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                  <span className="text-xs text-gray-500">N.° de pago</span>
                  <span className="text-sm font-semibold text-gray-900">#{paymentId}</span>
                </div>
              )}
              {order?.email && (
                <p className="text-xs text-gray-400 mt-3">
                  Confirmación enviada a <span className="font-medium text-gray-600">{order.email}</span>
                </p>
              )}
            </div>

            {/* Post-purchase upsells */}
            {isContraentrega && !upsellDismissed && postPurchaseUpsells.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5 sm:p-6 space-y-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">¡Estamos empacando tu pedido!</span>{" "}
                    ¿Quieres agregar algo más antes de que salgamos a entregar?
                  </p>

                  {postPurchaseUpsells.map((product) => {
                    const isAdded = upsellAdded === product.id;
                    return (
                      <div key={product.id} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="flex items-center gap-3 p-3">
                          {product.image && (
                            <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                              <Image src={product.image} alt={product.name} width={64} height={64}
                                className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900">{product.name}</p>
                            {product.variant && <p className="text-xs text-gray-500">{product.variant}</p>}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-bold text-gray-900">{formatCOP(product.price)}</span>
                              {product.compare_price && product.compare_price > product.price && (
                                <>
                                  <span className="text-xs text-gray-400 line-through">{formatCOP(product.compare_price)}</span>
                                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                    -{Math.round((1 - product.price / product.compare_price) * 100)}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="px-3 pb-3 space-y-2">
                          {isAdded ? (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              <p className="text-sm font-semibold text-green-800">¡Añadido a tu pedido!</p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpsell(product.id)}
                              disabled={!!upsellLoading || !!upsellAdded}
                              className="w-full flex items-center justify-center gap-2 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                              style={{ backgroundColor: brandColor }}
                            >
                              {upsellLoading === product.id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              )}
                              Añadir a mi pedido
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <button type="button" onClick={handleDismissUpsell}
                    className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    No gracias, continuar sin agregar
                  </button>
                </div>
              </div>
            )}

            {/* Items del pedido */}
            {order && order.items.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="font-semibold text-gray-900 text-sm mb-4">Tu pedido</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={48} height={48}
                              className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: brandColor }}
                        >
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                        {formatCOP(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900 text-sm">Total</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCOP(order.total)}</span>
                </div>
              </div>
            )}

            {/* Próximos pasos */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">¿Qué sigue?</h2>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                      step.active ? "text-white" : "bg-gray-100 text-gray-400"
                    }`}
                      style={step.active ? { backgroundColor: brandColor } : {}}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${step.active ? "text-gray-900" : "text-gray-500"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      <footer className="py-5 text-center border-t border-gray-100 bg-white">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} {brand?.name} · Powered by PayPixel</p>
      </footer>
    </div>
  );
}
