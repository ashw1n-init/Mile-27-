"use client";

import type { Cart } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { ProductImage } from "@/components/ui/product-image";

interface SummaryProps {
  cart: Cart;
}

export function Summary({ cart }: SummaryProps) {
  const tc = useTranslations("common");
  const t = useTranslations("checkout");
  const items = cart.items || [];
  const hasShipping = (cart.fulfillments?.length ?? 0) > 0;

  return (
    <div className="text-[#0a0a0a]">
      {/* Line items */}
      <div className="space-y-0 pb-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[24px_72px_1fr_auto] items-center gap-3 border-b border-black/15 py-5 first:pt-0"
          >
            <span className="text-[9px] tracking-[0.16em] text-[#d4030a]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative h-[72px] w-[72px] flex-shrink-0">
              <div className="relative h-full w-full overflow-hidden bg-[#f7f7f5]">
                <ProductImage
                  src={item.thumbnail_url}
                  alt={item.name}
                  fill
                  className="object-contain p-1"
                  iconClassName="w-6 h-6"
                />
              </div>
              {/* Quantity badge — Shopify style: top-right, dark bg */}
              <div className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center bg-black text-[9px] font-medium text-white">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium leading-snug">{item.name}</p>
              {item.options_text && (
                <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-black/45">
                  {item.options_text}
                </p>
              )}
            </div>
            <div className="text-xs tabular-nums">{item.display_total}</div>
          </div>
        ))}
      </div>

      {/* Totals — Shopify style */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">{tc("subtotal")}</span>
          <span className="text-gray-900">{cart.display_item_total}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">{tc("shipping")}</span>
          {hasShipping ? (
            <span className="text-gray-900">{cart.display_delivery_total}</span>
          ) : (
            <span className="text-xs text-gray-500">
              {t("enterShippingAddress")}
            </span>
          )}
        </div>

        {cart.discount_total && parseFloat(cart.discount_total) !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">{tc("discount")}</span>
            <span className="text-[#d4030a]">
              {cart.display_discount_total}
            </span>
          </div>
        )}

        {parseFloat(cart.tax_total ?? "0") > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">{tc("tax")}</span>
            <span className="text-gray-900">{cart.display_tax_total}</span>
          </div>
        )}

        {/* Total row */}
        <div className="flex items-end justify-between border-t border-black/15 pt-6">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em]">
            {tc("total")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[9px] uppercase tracking-[0.14em] text-black/40">
              {cart.currency}
            </span>
            <span className="text-3xl font-medium tracking-[-0.05em] tabular-nums">
              {cart.display_total}
            </span>
          </div>
        </div>

        {/* Gift card or store credit — shown below total, reduces amount due.
            Gift cards use store credits under the hood, so only show one. */}
        {cart.gift_card && parseFloat(cart.gift_card_total ?? "0") > 0 ? (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">{tc("giftCard")}</span>
            <span className="text-[#d4030a]">
              -{cart.display_gift_card_total}
            </span>
          </div>
        ) : cart.store_credit_total &&
          parseFloat(cart.store_credit_total) > 0 ? (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">{tc("storeCredit")}</span>
            <span className="text-[#d4030a]">
              -{cart.display_store_credit_total}
            </span>
          </div>
        ) : null}

        {/* Amount due — only shown when gift card or store credit is applied */}
        {cart.amount_due &&
          cart.amount_due !== cart.total &&
          parseFloat(cart.amount_due) > 0 && (
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
              <span className="text-base font-bold text-gray-900">
                {tc("amountDue")}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-500 uppercase">
                  {cart.currency}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {cart.display_amount_due}
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
