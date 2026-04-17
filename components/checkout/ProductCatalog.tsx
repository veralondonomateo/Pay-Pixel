"use client";

import Image from "next/image";
import type { BrandPublic } from "@/types/tenant";
import type { ShopifyProduct } from "@/lib/shopify";
import CheckoutHeader from "./CheckoutHeader";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

const DEMO_PRODUCTS: ShopifyProduct[] = [
  {
    id: 1,
    title: "Producto ejemplo — Talla S",
    handle: "producto-ejemplo",
    status: "active",
    variants: [
      { id: 101, title: "Talla S", price: "89900", inventory_quantity: 20 },
      { id: 102, title: "Talla M", price: "89900", inventory_quantity: 15 },
      { id: 103, title: "Talla L", price: "94900", inventory_quantity: 8 },
    ],
    images: [],
  },
  {
    id: 2,
    title: "Otro producto — Color Negro",
    handle: "otro-producto",
    status: "active",
    variants: [
      { id: 201, title: "Negro", price: "120000", inventory_quantity: 30 },
      { id: 202, title: "Blanco", price: "120000", inventory_quantity: 12 },
    ],
    images: [],
  },
];

interface Props {
  brand: BrandPublic;
  slug: string;
  products: ShopifyProduct[];
  isDemo?: boolean;
}

export default function ProductCatalog({ brand, slug, products, isDemo = false }: Props) {
  const brandColor = brand.primary_color ?? "#6366f1";
  const displayProducts = products.length ? products : DEMO_PRODUCTS;

  function goToCheckout(handle: string, variantId: number) {
    window.location.href = `/checkout/${slug}?product=${handle}&variant=${variantId}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CheckoutHeader brand={brand} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {brand.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Elige el producto que deseas comprar
          </p>
          {isDemo && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-amber-700 font-medium">
                Vista de ejemplo — Conecta Shopify para mostrar tus productos reales
              </span>
            </div>
          )}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {displayProducts.map((product) => {
            const mainVariant = product.variants[0];
            const mainPrice = mainVariant ? Math.round(parseFloat(mainVariant.price)) : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product image */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {product.images[0]?.src ? (
                    <Image
                      src={product.images[0].src}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {isDemo && (
                        <p className="text-xs text-gray-400 mt-2">Imagen del producto</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 text-base leading-tight mb-1">
                    {product.title}
                  </h2>
                  <p className="text-lg font-bold mb-3" style={{ color: brandColor }}>
                    {formatCOP(mainPrice)}
                  </p>

                  {/* Variants */}
                  {product.variants.length === 1 &&
                  product.variants[0].title === "Default Title" ? (
                    /* Single variant — direct buy button */
                    <button
                      onClick={() => goToCheckout(product.handle, product.variants[0].id)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: brandColor }}
                    >
                      Comprar ahora
                    </button>
                  ) : (
                    /* Multiple variants */
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Selecciona una opción:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => {
                          const price = Math.round(parseFloat(variant.price));
                          const outOfStock = variant.inventory_quantity === 0;
                          return (
                            <button
                              key={variant.id}
                              disabled={outOfStock}
                              onClick={() => goToCheckout(product.handle, variant.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all
                                ${outOfStock
                                  ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                  : "border-gray-200 text-gray-700 hover:border-current hover:text-current active:scale-95"
                                }
                              `}
                              style={outOfStock ? {} : { borderColor: "transparent" }}
                              onMouseEnter={(e) => {
                                if (!outOfStock) {
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = brandColor;
                                  (e.currentTarget as HTMLButtonElement).style.color = brandColor;
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${brandColor}10`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!outOfStock) {
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
                                  (e.currentTarget as HTMLButtonElement).style.color = "#374151";
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                                }
                              }}
                            >
                              {variant.title}
                              {price !== mainPrice && (
                                <span className="ml-1 text-gray-400">· {formatCOP(price)}</span>
                              )}
                              {outOfStock && <span className="ml-1 text-gray-400">(Agotado)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="py-5 text-center border-t border-gray-200 bg-white">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <span>·</span>
          <span className="text-gray-300">Powered by PayPixel</span>
        </div>
      </footer>
    </div>
  );
}
