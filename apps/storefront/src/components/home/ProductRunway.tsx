"use client";

import type { Product } from "@spree/sdk";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";

interface ProductRunwayProps {
  basePath: string;
  newArrivals: Product[];
  topPicks: Product[];
}

type RunwayView = "new" | "top";

function RunwayProductCard({
  product,
  basePath,
  showNew,
  index,
}: {
  product: Product;
  basePath: string;
  showNew: boolean;
  index: number;
}) {
  return (
    <article className="group min-w-0">
      <Link
        href={`${basePath}/products/${product.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <div className="relative aspect-[1.12/1] overflow-hidden bg-white">
          <span className="absolute left-3 top-3 z-10 font-sans text-[9px] tracking-[0.16em] text-black/40">
            {String(index + 1).padStart(2, "0")}
          </span>
          <ProductImage
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 42vw, 17vw"
            className="object-contain p-[5%] transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.055]"
          />
          {showNew && (
            <span className="absolute right-3 top-3 bg-[#d4030a] px-2 py-1 font-sans text-[8px] font-semibold uppercase leading-none tracking-[0.1em] text-black">
              Just in
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[#d4030a] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="absolute bottom-3 right-3 flex size-10 translate-y-2 items-center justify-center rounded-full bg-black text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>

        <div className="border-t border-black/15 pt-4">
          <h3 className="min-h-[2.6em] max-w-[28ch] text-[13px] font-medium leading-[1.32] tracking-[-0.025em] text-black sm:text-[14px]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[13px] text-black">
            {product.price?.display_amount && (
              <span>{product.price.display_amount}</span>
            )}
            {product.original_price?.display_amount &&
              product.original_price.display_amount !==
                product.price?.display_amount && (
                <span className="text-xs text-black/40 line-through">
                  {product.original_price.display_amount}
                </span>
              )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductRunway({
  basePath,
  newArrivals,
  topPicks,
}: ProductRunwayProps) {
  const [view, setView] = useState<RunwayView>("new");
  const products = view === "new" ? newArrivals : topPicks;
  const label = view === "new" ? "New Arrivals" : "Top Picks";
  const nextLabel = view === "new" ? "Top Picks" : "New Arrivals";

  function changeView(nextView: RunwayView) {
    if (nextView === view) return;

    if (
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      "vibrate" in navigator
    ) {
      navigator.vibrate(12);
    }

    setView(nextView);
  }

  function toggleView() {
    changeView(view === "new" ? "top" : "new");
  }

  return (
    <section
      aria-labelledby="product-runway-title"
      className="relative overflow-hidden bg-white px-0 pb-16 pt-14 text-black sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24"
    >
      <div className="text-center">
        <h2 id="product-runway-title" className="sr-only">
          New Arrivals and Top Picks
        </h2>
        <button
          type="button"
          onClick={toggleView}
          aria-label={`Showing ${label}. Switch to ${nextLabel}`}
          aria-controls="product-runway-panel"
          className="product-title-ticker-window block w-full cursor-pointer text-center focus-visible:outline-offset-[-4px]"
        >
          <span
            aria-hidden="true"
            className="product-title-ticker block will-change-transform"
            style={{
              transform: `translate3d(0, ${view === "new" ? "0" : "-50%"}, 0)`,
            }}
          >
            {(["new", "top"] as const).map((item) => (
              <span
                key={item}
                className={`flex h-[clamp(3.5rem,7vw,8rem)] items-center justify-center whitespace-nowrap text-[clamp(2.6rem,5.6vw,6.75rem)] font-semibold leading-none tracking-[-0.065em] transition-colors duration-500 ${
                  view === item ? "text-black" : "text-black/20"
                }`}
              >
                {item === "new" ? "New Arrivals" : "Top Picks"}
                <span className="ml-[3vw] size-3 shrink-0 rounded-full bg-[#d4030a] sm:size-4" />
              </span>
            ))}
          </span>
        </button>

        <div
          role="tablist"
          aria-label="Product selection"
          className="mt-6 flex justify-center gap-2"
        >
          {(["new", "top"] as const).map((item) => (
            <button
              type="button"
              role="tab"
              key={item}
              aria-selected={view === item}
              aria-controls="product-runway-panel"
              onClick={() => changeView(item)}
              className={`h-1 transition-[width,background-color] duration-500 ${
                view === item ? "w-10 bg-[#d4030a]" : "w-4 bg-black/20"
              }`}
            >
              <span className="sr-only">
                {item === "new" ? "New Arrivals" : "Top Picks"}
              </span>
            </button>
          ))}
        </div>
        <Link
          href={`${basePath}/products?sort=${view === "new" ? "-available_on" : "best_selling"}`}
          className="group/link mt-7 inline-flex items-center gap-2 font-sans text-[10px] font-medium uppercase tracking-[0.12em]"
        >
          Shop {label}
          <ArrowUpRight className="size-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
        </Link>
      </div>

      <div
        id="product-runway-panel"
        role="tabpanel"
        className="product-runway mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 sm:mt-20 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:overflow-visible sm:px-8 lg:mt-24 lg:px-8 xl:grid-cols-6 xl:gap-x-3"
      >
        {products.map((product, index) => (
          <div
            key={`${view}-${product.id}`}
            className="w-[82vw] shrink-0 snap-start sm:w-auto"
          >
            <RunwayProductCard
              product={product}
              basePath={basePath}
              showNew={view === "new"}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
