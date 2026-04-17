import type { BrandPublic } from "@/types/tenant";

interface Props {
  brand: BrandPublic;
}

export default function CheckoutHeader({ brand }: Props) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo / Brand name */}
        <div className="flex items-center min-w-0">
          {brand.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="block h-10 w-auto max-w-[200px] object-contain"
              style={{ maxHeight: 40 }}
            />
          ) : (
            <span className="text-lg font-bold text-gray-900 truncate">
              {brand.name}
            </span>
          )}
        </div>

        {/* Security badge */}
        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium flex-shrink-0 ml-4">
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
