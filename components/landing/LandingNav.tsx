"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Calculadora",   href: "#calculadora" },
  { label: "Precios",       href: "#precios" },
  { label: "Demo",          href: "/demo/dashboard" },
];

export default function LandingNav() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#080808]/90 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src="/Pay Pixel-1.png" alt="PayPixel" width={90} height={19} className="object-contain" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[13px] text-white/40 hover:text-white/80 transition-colors px-3.5 py-1.5 rounded-lg hover:bg-white/[0.05]"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link
              href="/login"
              className="text-[13px] text-white/40 hover:text-white/80 transition-colors px-3.5 py-1.5 rounded-lg hover:bg-white/[0.05]"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-medium bg-white text-black hover:bg-white/90 px-4 py-1.5 rounded-lg transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Mobile: compact CTA + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="text-[12px] font-semibold bg-indigo-500 hover:bg-indigo-400 text-white px-3.5 py-2 rounded-lg transition-colors shadow-[0_0_16px_rgba(99,102,241,0.4)]"
            >
              Gratis
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <span
                className={`block h-[1.5px] bg-white/60 rounded-full transition-all duration-250 origin-center ${
                  open ? "w-5 rotate-45 translate-y-[6.5px]" : "w-5"
                }`}
              />
              <span
                className={`block h-[1.5px] bg-white/60 rounded-full transition-all duration-250 ${
                  open ? "w-0 opacity-0" : "w-4"
                }`}
              />
              <span
                className={`block h-[1.5px] bg-white/60 rounded-full transition-all duration-250 origin-center ${
                  open ? "w-5 -rotate-45 -translate-y-[6.5px]" : "w-5"
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* drawer */}
        <div
          className={`absolute top-[60px] left-0 right-0 bg-[#09090f]/98 backdrop-blur-2xl border-b border-white/[0.07] transition-all duration-300 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="px-4 py-5 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 text-[15px] text-white/55 hover:text-white hover:bg-white/[0.04] px-3 py-3 rounded-xl transition-colors"
              >
                <span className="w-1 h-1 rounded-full bg-indigo-500/60" />
                {label}
              </a>
            ))}
          </div>

          <div className="px-4 pb-5 pt-1 border-t border-white/[0.05] flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-[14px] font-medium text-center text-white/60 border border-white/[0.1] hover:bg-white/[0.05] hover:text-white px-4 py-3 rounded-xl transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block text-[14px] font-semibold text-center bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-3 rounded-xl transition-all shadow-[0_0_24px_rgba(99,102,241,0.4)]"
            >
              Empezar gratis →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
