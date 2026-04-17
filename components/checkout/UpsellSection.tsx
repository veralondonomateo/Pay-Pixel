"use client";

import Image from "next/image";
import type { UpsellProduct } from "@/types/tenant";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

interface Props {
  products: UpsellProduct[];
  qty: Record<string, number>;
  onToggle: (id: string) => void;
  brandColor: string;
  stepNumber?: number;
  isDemo?: boolean;
}

export default function UpsellSection({
  products,
  qty,
  onToggle,
  brandColor,
  stepNumber = 3,
  isDemo = false,
}: Props) {
  if (!products.length) return null;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {stepNumber}
          </span>
          Agrega más productos
        </h3>
        {isDemo && (
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Ejemplo · Configura en tu panel
          </span>
        )}
      </div>

      <div className="space-y-3">
        {products.map((product) => {
          const isSelected = (qty[product.id] ?? 0) > 0;
          const discount =
            product.compare_price && product.compare_price > product.price
              ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
              : null;

          return (
            <div
              key={product.id}
              onClick={() => !isDemo && onToggle(product.id)}
              className={`
                relative rounded-xl border-2 transition-all
                ${isDemo ? "cursor-default opacity-80" : "cursor-pointer"}
                ${
                  isSelected
                    ? ""
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }
              `}
              style={isSelected ? { borderColor: brandColor, backgroundColor: `${brandColor}08` } : {}}
            >
              <div className="flex items-center gap-3 p-3">
                {/* Imagen */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {product.name}
                  </p>
                  {product.variant && (
                    <p className="text-xs text-gray-500 mt-0.5">{product.variant}</p>
                  )}
                  {product.benefit && (
                    <p className="text-xs font-medium mt-0.5 flex items-center gap-1" style={{ color: brandColor }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {product.benefit}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCOP(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          {formatCOP(product.compare_price)}
                        </span>
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      </>
                    )}
                    {product.stock > 0 && product.stock < 10 && (
                      <span className="text-[10px] text-orange-600 font-medium">
                        ¡Solo {product.stock} disponibles!
                      </span>
                    )}
                  </div>
                </div>

                {/* Checkbox */}
                {!isDemo && (
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all"
                    style={
                      isSelected
                        ? { backgroundColor: brandColor, borderColor: brandColor }
                        : { borderColor: "#d1d5db" }
                    }
                  >
                    {isSelected ? (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {/* Social proof */}
              {product.sold_today > 0 && (
                <div className="px-3 pb-2.5">
                  <p className="text-xs text-gray-400">
                    🔥 {product.sold_today} personas lo agregaron hoy
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
