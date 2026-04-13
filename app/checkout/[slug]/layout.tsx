import type { Metadata } from "next";
import Script from "next/script";
import { createServiceClient } from "@/lib/supabase";
import type { Brand } from "@/types/tenant";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("brands")
    .select("name")
    .eq("slug", slug)
    .single();

  return {
    title: data ? `${data.name} | Finalizar compra` : "Checkout",
    description: "Checkout seguro",
  };
}

export default async function CheckoutTenantLayout({ children, params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("meta_pixel_id, tiktok_pixel_id, name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Pick<Brand, "meta_pixel_id" | "tiktok_pixel_id" | "name">>();

  return (
    <>
      {/* TikTok Pixel — solo si el tenant lo tiene configurado */}
      {brand?.tiktok_pixel_id && (
        <Script id={`ttq-${slug}`} strategy="afterInteractive">{`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('${brand.tiktok_pixel_id}');
            ttq.page();
          }(window, document, 'ttq');
        `}</Script>
      )}

      {/* Meta Pixel — solo si el tenant lo tiene configurado */}
      {brand?.meta_pixel_id && (
        <>
          <Script id={`fbq-${slug}`} strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${brand.meta_pixel_id}');
            fbq('track', 'PageView');
          `}</Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${brand.meta_pixel_id}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {children}
    </>
  );
}
