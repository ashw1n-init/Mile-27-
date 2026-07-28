"use client";

import type { Product } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { memo } from "react";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { ProductImage } from "@/components/ui/product-image";
import { trackSelectItem } from "@/lib/analytics/gtm";
import { getProductCardAlternateImage } from "@/lib/product-card-media";

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
  const alternateImageUrl = getProductCardAlternateImage(product);
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
      className="group relative block min-w-0 overflow-hidden rounded-[1.25rem] bg-white/80 shadow-[0_14px_45px_rgba(56,61,64,0.08)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(56,61,64,0.13)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d4030a]"
      onClick={handleClick}
    >
      <div className="flex min-h-10 items-center justify-between gap-2 px-3 py-2 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-black/45 sm:px-4 sm:text-[10px]">
        <span title={`Product index ${productIndex}`}>{productIndex}</span>
        <span className="truncate text-right">{context}</span>
      </div>

      <div className="relative mx-2 aspect-[4/5] overflow-hidden rounded-[1rem] bg-[#f1f2f0]">
        <ProductImage
          src={imageUrl}
          alt={product.name}
          fill
          className={`object-contain p-3 transition-opacity duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none sm:p-5 ${alternateImageUrl ? "group-hover:opacity-0 group-focus-visible:opacity-0" : ""}`}
          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1535px) 25vw, 20vw"
          iconClassName="w-16 h-16"
          fetchPriority={fetchPriority}
        />
        {alternateImageUrl && (
          <ProductImage
            src={alternateImageUrl}
            alt={`${product.name} alternate variant`}
            fill
            className="object-contain p-3 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none sm:p-5"
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1535px) 25vw, 20vw"
          />
        )}
      </div>

      <div className="px-3 py-3 sm:px-4 sm:py-4">
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

        <div className="mt-4 flex items-center justify-between rounded-full bg-black/[0.045] px-3 py-2 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-black/55 sm:text-[10px]">
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
