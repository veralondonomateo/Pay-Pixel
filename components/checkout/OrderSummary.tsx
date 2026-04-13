"use client";

import Image from "next/image";
import type { CheckoutItem } from "@/types/checkout";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

interface Props {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  total: number;
  discount: number;
  coupon: string;
  couponApplied: boolean;
  couponError: string;
  onCouponChange: (v: string) => void;
  onCouponApply: () => void;
  mainQty: number;
  onMainQtyChange: (v: number) => void;
  brandColor: string;
}

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
  discount,
  coupon,
  couponApplied,
  couponError,
  onCouponChange,
  onCouponApply,
  mainQty,
  onMainQtyChange,
  brandColor,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {/* Items */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Qty badge / control para el primer item */}
              {idx === 0 ? (
                <div className="absolute -top-2 -right-2 flex items-center gap-0.5 bg-white border border-gray-200 rounded-full shadow-sm">
                  <button
                    type="button"
                    onClick={() => onMainQtyChange(Math.max(1, mainQty - 1))}
                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 text-xs font-bold rounded-full"
                  >
                    −
                  </button>
                  <span className="text-xs font-semibold text-gray-800 min-w-[16px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMainQtyChange(mainQty + 1)}
                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 text-xs font-bold rounded-full"
                  >
                    +
                  </button>
                </div>
              ) : (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: brandColor }}
                >
                  {item.quantity}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm leading-tight">{item.name}</p>
              {item.variant && (
                <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
              )}
            </div>
            <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
              {formatCOP(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Cupón */}
      <div className="border-t border-gray-100 pt-3">
        {!couponApplied && (
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => onCouponChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCouponApply()}
              placeholder="Código de descuento"
              className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                ${couponError ? "border-red-400" : "border-gray-300 focus:border-indigo-400"}`}
              disabled={couponApplied}
            />
            <button
              type="button"
              onClick={onCouponApply}
              disabled={!coupon.trim()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Aplicar
            </button>
          </div>
        )}
        {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
        {couponApplied && (
          <p className="text-xs font-medium text-green-600">
            ✓ Descuento aplicado: −{formatCOP(discount)}
          </p>
        )}
      </div>

      {/* Totales */}
      <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCOP(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento</span>
            <span>−{formatCOP(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span>{shipping > 0 ? formatCOP(shipping) : "Gratis"}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-1.5 border-t border-gray-100">
          <span>Total</span>
          <span>{formatCOP(total)}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          SSL seguro
        </span>
        <span className="text-gray-200">|</span>
        <span className="text-xs text-gray-400">Pago 100% seguro</span>
      </div>
    </div>
  );
}
