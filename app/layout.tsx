import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PayPixel — Checkout con atribución perfecta",
  description:
    "Checkout personalizado para marcas DTC en Colombia y LATAM. Mejor atribución de píxeles, upsells y recuperación de carritos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      {/*
        NO hay píxeles globales aquí.
        Cada checkout tenant inyecta sus propios píxeles en su layout.
      */}
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
