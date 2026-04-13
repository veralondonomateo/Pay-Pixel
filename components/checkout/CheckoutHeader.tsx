import Image from "next/image";
import type { BrandPublic } from "@/types/tenant";

interface Props {
  brand: BrandPublic;
}

export default function CheckoutHeader({ brand }: Props) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {brand.logo_url ? (
            <Image
              src={brand.logo_url}
              alt={brand.name}
              width={120}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          ) : (
            <span className="text-lg font-bold text-gray-900">{brand.name}</span>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Compra segura
        </span>
      </div>
    </header>
  );
}
