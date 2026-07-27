"use client";

import type { Product } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { memo } from "react";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { ProductImage } from "@/components/ui/product-image";
import { trackSelectItem } from "@/lib/analytics/gtm";

const BRAND_PERMALINK_PATTERN = /(^|\/)brands?(\/|$)/i;
const TAG_PERMALINK_PATTERN = /(^|\/)tags?(\/|$)/i;

interface ProductCardProps {
  product: Product;
  basePath?: string;
  categoryId?: string;
  index?: number;
  listId?: string;
  listName?: string;
  fetchPriority?: "high" | "low" | "auto";
  /** Optional currency used for analytics; omit to skip the select_item event. */
  currency?: string;
}

export const ProductCard = memo(function ProductCard({
  product,
  basePath = "",
  categoryId,
  index,
  listId,
  listName,
  fetchPriority,
  currency,
}: ProductCardProps) {
  const t = useTranslations("products");
  const imageUrl = product.thumbnail_url || null;
  const categories =
    product.categories?.filter((category) => !category.is_root) ?? [];
  const brand = categories.find((category) =>
    BRAND_PERMALINK_PATTERN.test(category.permalink),
  );
  const category = categories.find(
    (item) =>
      item.id !== brand?.id && !TAG_PERMALINK_PATTERN.test(item.permalink),
  );
  const context = brand?.name ?? category?.name ?? "Mile 27 equipment";
  const productIndex =
    index == null ? "M27" : String(index + 1).padStart(3, "0");

  // Current display price
  const displayPrice = product.price?.display_amount;

  const currentAmountCents = product.price?.amount_in_cents;
  const originalAmountCents = product.original_price?.amount_in_cents;
  const compareAtAmountCents = product.price?.compare_at_amount_in_cents;
  const onSale =
    (currentAmountCents != null &&
      originalAmountCents != null &&
      currentAmountCents < originalAmountCents) ||
    (compareAtAmountCents != null &&
      currentAmountCents != null &&
      currentAmountCents < compareAtAmountCents);

  const strikethroughPrice = onSale
    ? ((product.original_price?.display_amount &&
      product.original_price.display_amount !== displayPrice
        ? product.original_price.display_amount
        : product.price?.display_compare_at_amount) ?? null)
    : null;

  const handleClick = () => {
    if (index != null && listId && listName && currency) {
      trackSelectItem(product, listId, listName, index, currency);
    }
  };

  return (
    <Link
      href={`${basePath}/products/${product.slug}${categoryId ? `?category_id=${categoryId}` : ""}`}
      className="group relative block min-w-0 border-r border-b border-[#9faaae] bg-white focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black"
      onClick={handleClick}
    >
      <div className="flex min-h-10 items-center justify-between gap-2 border-b border-[#9faaae] px-3 py-2 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-black/55 sm:px-4 sm:text-[10px]">
        <span title={`Product index ${productIndex}`}>{productIndex}</span>
        <span className="truncate text-right">{context}</span>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-[#ffffff]">
        <ProductImage
          src={imageUrl}
          alt={product.name}
          fill
          className="object-contain p-3 transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-[0.5%] motion-safe:group-hover:scale-[1.012] sm:p-5"
          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1535px) 25vw, 20vw"
          iconClassName="w-16 h-16"
          fetchPriority={fetchPriority}
        />
      </div>

      <div className="border-t border-[#9faaae] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-2 flex min-h-3 items-center justify-between gap-2 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-[10px]">
          <span className={onSale ? "text-[#d4030a]" : "text-black/45"}>
            {onSale ? t("sale") : "Product file"}
          </span>
          {!product.purchasable && (
            <span className="text-black/55">{t("outOfStock")}</span>
          )}
        </div>

        <h3 className="line-clamp-2 h-8 overflow-hidden text-[13px] font-semibold leading-4 tracking-[-0.025em] text-black sm:h-9 sm:text-[15px] sm:leading-[18px]">
          {product.name}
        </h3>

        <div className="mt-3 flex min-h-5 flex-wrap items-baseline gap-x-2 gap-y-1">
          {displayPrice ? (
            <span className="text-[13px] font-semibold tracking-[-0.015em] text-black sm:text-sm">
              {displayPrice}
            </span>
          ) : (
            // Null price: a deliberate hide inside a HiddenPricingProvider
            // (renders a sign-in prompt), otherwise renders nothing.
            <HiddenPricePrompt />
          )}
          {onSale && strikethroughPrice && (
            <span className="text-[11px] text-black/45 line-through">
              {strikethroughPrice}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-black/15 pt-2 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-black/55 sm:text-[10px]">
          <span>View equipment</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
});
