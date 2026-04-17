"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BrandPublic, UpsellProduct } from "@/types/tenant";
import type { CheckoutItem, CheckoutFormData } from "@/types/checkout";
import type { ShopifyProduct } from "@/lib/shopify";
import CheckoutHeader from "./CheckoutHeader";
import EmailSection from "./EmailSection";
import ContactSection from "./ContactSection";
import DeliverySection from "./DeliverySection";
import UpsellSection from "./UpsellSection";
import PaymentSection from "./PaymentSection";
import OrderSummary from "./OrderSummary";
import Button from "@/components/ui/Button";

const SHIPPING = 0;

const schema = z.object({
  email: z
    .string()
    .min(1, "Este campo es obligatorio")
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), "Ingresa un email válido"),
  firstName: z.string().min(2, "Ingresa tu nombre"),
  lastName: z.string().min(2, "Ingresa tu apellido"),
  cedula: z.string().optional(),
  address: z.string().min(5, "Ingresa una dirección válida"),
  complement: z.string().optional(),
  state: z.string().min(1, "Selecciona un departamento"),
  city: z.string().min(1, "Selecciona una ciudad"),
  phone: z
    .string()
    .refine((v) => /^\d{10}$/.test(v.replace(/[\s\-]/g, "")), "Ingresa los 10 dígitos de tu celular")
    .transform((v) => v.replace(/[\s\-]/g, "")),
  paymentMethod: z.enum(["mercadopago", "contraentrega"] as const),
  saveInfo: z.boolean().optional(),
});

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

function shopifyProductToItem(p: ShopifyProduct, variantId?: number): CheckoutItem {
  const variant = variantId
    ? (p.variants.find((v) => v.id === variantId) ?? p.variants[0])
    : p.variants[0];
  return {
    id: String(p.id),
    name: p.title,
    variant: variant?.title !== "Default Title" ? variant?.title : undefined,
    price: Math.round(parseFloat(variant?.price ?? "0")),
    quantity: 1,
    image: p.images[0]?.src ?? "",
    shopifyVariantId: variant?.id,
  };
}

// ── Default upsells shown when the brand hasn't configured any yet ─────────────
const DEMO_UPSELLS: UpsellProduct[] = [
  {
    id: "demo-upsell-1",
    brand_id: "",
    shopify_handle: "",
    name: "Producto complementario",
    variant: "Ejemplo de variante",
    price: 49900,
    compare_price: 79900,
    image: null,
    benefit: "Perfecto para completar tu pedido",
    stock: 12,
    sold_today: 7,
    position: 1,
    show_in_checkout: true,
    show_post_purchase: false,
  },
  {
    id: "demo-upsell-2",
    brand_id: "",
    shopify_handle: "",
    name: "Accesorio adicional",
    variant: null,
    price: 34900,
    compare_price: 59900,
    image: null,
    benefit: "Incluye garantía de 6 meses",
    stock: 5,
    sold_today: 3,
    position: 2,
    show_in_checkout: true,
    show_post_purchase: false,
  },
];

interface Props {
  brand: BrandPublic;
  slug: string;
  shopifyProduct?: ShopifyProduct | null;
  upsellProducts: UpsellProduct[];
  isShopifyConnected?: boolean;
  initialVariantId?: number;
  initialQty?: number;
  recoveryData?: {
    first_name?: string | null;
    email?: string | null;
    phone?: string | null;
    items: CheckoutItem[];
    total?: number | null;
  } | null;
}

export default function CheckoutPageClient({
  brand,
  slug,
  shopifyProduct,
  upsellProducts,
  isShopifyConnected = false,
  initialVariantId,
  initialQty = 1,
  recoveryData,
}: Props) {
  const brandColor = brand.primary_color ?? "#6366f1";

  // ── Form ────────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: "mercadopago",
      firstName: recoveryData?.first_name ?? "",
      email: recoveryData?.email ?? "",
      phone: recoveryData?.phone ?? "",
    },
  });

  // ── Items ───────────────────────────────────────────────────────────────────
  const mainItem: CheckoutItem = shopifyProduct
    ? shopifyProductToItem(shopifyProduct, initialVariantId)
    : {
        id: "product",
        name: "Producto",
        price: 0,
        quantity: 1,
        image: "",
      };

  const [mainQty, setMainQty] = useState(initialQty);
  const [upsellQty, setUpsellQty] = useState<Record<string, number>>({});

  // ── Determine which upsells to show ─────────────────────────────────────────
  // - Real upsells: show real ones (real data from DB, not demo)
  // - Shopify connected but no configured upsells: no section (empty)
  // - Shopify NOT connected: show demo upsells so owner sees how it looks
  const showDemoUpsells = !isShopifyConnected && upsellProducts.length === 0;
  const activeUpsells = upsellProducts.length > 0 ? upsellProducts : showDemoUpsells ? DEMO_UPSELLS : [];

  // ── Step numbering ───────────────────────────────────────────────────────────
  const hasUpsells = activeUpsells.length > 0;
  const contactStep = 2;
  const deliveryStep = 3;
  const upsellStep = 4;
  const paymentStep = hasUpsells ? 5 : 4;

  // Pixel: InitiateCheckout
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).fbq) (window as any).fbq("track", "InitiateCheckout");
      if ((window as any).ttq) (window as any).ttq.track("InitiateCheckout");
    }
  }, []);

  // ── Coupons ─────────────────────────────────────────────────────────────────
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(`/api/${slug}/validate-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setCouponError(data.error ?? "Código no válido");
      } else {
        setCouponApplied(true);
        setCouponDiscount(data.discount ?? 0);
      }
    } catch {
      setCouponError("Error validando cupón");
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Upsell toggles ──────────────────────────────────────────────────────────
  const handleUpsellToggle = (id: string) =>
    setUpsellQty((prev) => ({ ...prev, [id]: prev[id] ? 0 : 1 }));

  // ── Totals ──────────────────────────────────────────────────────────────────
  const allItems = useMemo<CheckoutItem[]>(() => {
    const main = { ...mainItem, quantity: mainQty };
    // Only add real upsells (not demo) to the cart
    const added = upsellProducts
      .filter((p) => (upsellQty[p.id] ?? 0) > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        variant: p.variant ?? undefined,
        price: p.price,
        quantity: upsellQty[p.id],
        image: p.image ?? "",
        shopifyVariantId: undefined,
      }));
    return [main, ...added];
  }, [mainQty, upsellQty, upsellProducts, mainItem]);

  const subtotal = useMemo(
    () => allItems.reduce((s, i) => s + i.price * i.quantity, 0),
    [allItems]
  );
  const discount = couponApplied ? couponDiscount : 0;
  const total = subtotal - discount + SHIPPING;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const getCookie = (name: string) =>
        document.cookie
          .split("; ")
          .find((r) => r.startsWith(`${name}=`))
          ?.split("=")[1];

      const res = await fetch(`/api/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: allItems,
          subtotal,
          shipping: SHIPPING,
          total,
          couponCode: couponApplied ? coupon : undefined,
          discount: couponApplied ? discount : undefined,
          fbp: getCookie("_fbp"),
          fbc: getCookie("_fbc"),
          ttp: getCookie("_ttp"),
        }),
      });

      if (!res.ok) throw new Error("Error del servidor");
      const result = await res.json();

      sessionStorage.setItem(
        `pp-order-${slug}`,
        JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          items: allItems,
          total,
          paymentMethod: data.paymentMethod,
        })
      );

      if (result.type === "contraentrega") {
        window.location.href = `/checkout/${slug}/thank-you?status=success&method=contraentrega&order_id=${result.order_id}`;
      } else if (result.init_point) {
        window.location.href = result.init_point;
      } else {
        throw new Error("No se recibió URL de pago");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setSubmitError("Ocurrió un error al procesar tu pedido. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CheckoutHeader brand={brand} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">

          {/* ── Formulario ── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Step 1 — Email */}
            <EmailSection register={register} errors={errors} brandColor={brandColor} />

            {/* Step 2 — Información personal */}
            <ContactSection
              register={register}
              errors={errors}
              brandColor={brandColor}
              stepNumber={contactStep}
            />

            {/* Step 3 — Dirección */}
            <DeliverySection
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              brandColor={brandColor}
              stepNumber={deliveryStep}
            />

            {/* Step 4 — Upsells (real o demo) */}
            {activeUpsells.length > 0 && (
              <UpsellSection
                products={activeUpsells}
                qty={showDemoUpsells ? {} : upsellQty}
                onToggle={handleUpsellToggle}
                brandColor={brandColor}
                stepNumber={upsellStep}
                isDemo={showDemoUpsells}
              />
            )}

            {/* Step 4/5 — Pago */}
            <PaymentSection
              register={register}
              errors={errors}
              watch={watch}
              brandColor={brandColor}
              stepNumber={paymentStep}
            />

            {/* Dirección de facturación */}
            <section className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Dirección de facturación</h3>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg border border-gray-200 p-3">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: brandColor }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                </div>
                <span className="text-sm text-gray-700">Usar la misma dirección de envío</span>
              </div>
            </section>

            {/* Submit */}
            <div className="sticky bottom-0 pb-4 pt-2 bg-gray-50">
              {submitError && (
                <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-700">{submitError}</p>
                </div>
              )}
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                brandColor={brandColor}
                className="text-base py-4 rounded-xl"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Completar pedido · {formatCOP(total)}</span>
              </Button>
              <p className="text-center text-xs text-gray-400 mt-2">
                Transacción 100% segura y encriptada
              </p>
            </div>
          </form>

          {/* ── Resumen lateral (desktop) ── */}
          <aside className="hidden lg:block sticky top-24">
            <OrderSummary
              items={allItems}
              subtotal={subtotal}
              shipping={SHIPPING}
              total={total}
              discount={discount}
              coupon={coupon}
              couponApplied={couponApplied}
              couponError={couponError}
              onCouponChange={(v) => { setCoupon(v); setCouponError(""); }}
              onCouponApply={handleApplyCoupon}
              mainQty={mainQty}
              onMainQtyChange={setMainQty}
              brandColor={brandColor}
            />
          </aside>
        </div>
      </main>

      <footer className="py-5 text-center border-t border-gray-200 bg-white">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <span>·</span>
          <a href="#" className="hover:text-gray-600 transition-colors">Política de privacidad</a>
          <span>·</span>
          <a href="#" className="hover:text-gray-600 transition-colors">Términos</a>
          <span>·</span>
          <span className="text-gray-300">Powered by PayPixel</span>
        </div>
      </footer>
    </div>
  );
}
