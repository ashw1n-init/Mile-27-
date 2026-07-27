"use client";

import type { Cart } from "@spree/sdk";
import { ArrowRight, CircleCheckBig, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { use, useEffect, useRef, useState } from "react";
import { AddressBlock } from "@/components/order/AddressBlock";
import { OrderTotals } from "@/components/order/OrderTotals";
import { PaymentInfo } from "@/components/order/PaymentInfo";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { useCheckout } from "@/contexts/CheckoutContext";
import { trackPurchase } from "@/lib/analytics/gtm";
import { getCompletedOrder } from "@/lib/data/checkout";
import { getCachedCompletedOrder } from "@/lib/utils/completed-order-cache";
import { extractBasePath } from "@/lib/utils/path";

interface OrderPlacedPageProps {
  params: Promise<{
    id: string;
    country: string;
    locale: string;
  }>;
}

export default function OrderPlacedPage({ params }: OrderPlacedPageProps) {
  const { id: cartId } = use(params);
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const { setSummaryContent } = useCheckout();
  const t = useTranslations("orderPlaced");
  const tc = useTranslations("common");

  const [order, setOrder] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"orderNotFound" | "failedToLoad" | null>(
    null,
  );

  // Clear sidebar summary
  useEffect(() => {
    setSummaryContent(null);
  }, [setSummaryContent]);

  // Track whether we've already loaded the order to avoid re-fetching
  // after the cart token cookie is cleared by CartProvider
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    let cancelled = false;

    async function loadOrder() {
      try {
        // Try cached order first (from the completion response),
        // fall back to API for page refreshes.
        const cached = getCachedCompletedOrder(cartId) as Cart | null;
        const orderData = cached ?? (await getCompletedOrder(cartId));
        if (cancelled) return;

        loadedRef.current = true;

        if (orderData) {
          setOrder(orderData);
          try {
            trackPurchase(orderData);
          } catch {
            // Analytics failure must not break the order confirmation UX
          }
        } else {
          setError("orderNotFound");
        }
        setLoading(false);
      } catch {
        if (!cancelled) {
          loadedRef.current = true;
          setError("failedToLoad");
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [cartId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 py-12">
        <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="h-64 bg-gray-200 rounded mt-8" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t(error || "orderNotFound")}
        </h1>
        <Button asChild>
          <Link href={`${basePath}/`}>{tc("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  const customerName =
    order.billing_address?.full_name || order.shipping_address?.full_name || "";

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* Success Header */}
      <div className="mb-12 grid gap-6 border-b border-black/15 pb-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <CircleCheckBig className="mb-6 h-7 w-7 text-[#d4030a]" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
            Ownership begins now
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
            {customerName
              ? t("thanksForOrder", { name: customerName.split(" ")[0] })
              : t("thanksForOrderAnonymous")}
          </h2>
        </div>
        <div className="md:text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
            Order reference
          </p>
          <p className="mt-2 text-xl font-medium tabular-nums">
            {t("orderNumber", { number: order.number })}
          </p>
          <p className="mt-2 text-xs text-black/45">{t("emailConfirmation")}</p>
        </div>
      </div>

      <div className="mb-12 grid gap-px bg-black/15 sm:grid-cols-4">
        {[
          ["01", "Confirmed", "Complete"],
          ["02", "Preparation", "Next"],
          ["03", "Dispatched", "Pending"],
          ["04", "Delivered", "Pending"],
        ].map(([number, label, status], index) => (
          <div key={number} className="bg-[#f7f7f5] p-6">
            <div className="flex justify-between text-[9px] uppercase tracking-[0.18em]">
              <span
                className={index === 0 ? "text-[#d4030a]" : "text-black/35"}
              >
                {number}
              </span>
              <span className="text-black/35">{status}</span>
            </div>
            <p
              className={`mt-12 text-sm font-medium ${index > 0 ? "text-black/35" : ""}`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Order Items */}
      <div className="mb-8 border-y border-black/15 bg-white">
        <div className="flex items-center justify-between border-b border-black/15 px-6 py-4">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em]">
            {t("orderItems")}
          </h2>
          <span className="text-[9px] text-black/40">
            {String(order.total_quantity).padStart(2, "0")} units
          </span>
        </div>
        <ul className="divide-y divide-black/15">
          {order.items?.map((item) => (
            <li key={item.id} className="flex gap-5 px-6 py-5">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-[#f7f7f5]">
                <ProductImage
                  src={item.thumbnail_url}
                  alt={item.name}
                  fill
                  className="object-contain p-1"
                  iconClassName="w-6 h-6"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  {item.name}
                </h3>
                {item.options_text && (
                  <p className="text-sm text-gray-500">{item.options_text}</p>
                )}
                <p className="text-sm text-gray-500">
                  {t("qty", { quantity: item.quantity })}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {item.display_total}
              </div>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-gray-200">
          <OrderTotals order={order} />
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="mb-8 overflow-hidden border-y border-black/15 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {/* Shipping Method */}
          {order.fulfillments && order.fulfillments.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t("shippingMethod")}
              </h3>
              {order.fulfillments.map((fulfillment) => (
                <div
                  key={fulfillment.id}
                  className="flex items-start gap-3 mb-2 last:mb-0"
                >
                  <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {fulfillment.delivery_method?.name ||
                        t("standardShipping")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fulfillment.display_cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Information */}
          {order.payments && order.payments.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t("payment")}
              </h3>
              {order.payments
                .filter((p) => p.status !== "void" && p.status !== "invalid")
                .map((payment) => (
                  <div key={payment.id} className="mb-3 last:mb-0">
                    <PaymentInfo
                      payment={payment}
                      storeCreditLabel={
                        order.gift_card ? t("giftCard") : undefined
                      }
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact & Addresses */}
      <div className="mb-8 overflow-hidden border-y border-black/15 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          {order.shipping_address && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {t("shippingAddress")}
              </h3>
              <AddressBlock address={order.shipping_address} />
            </div>
          )}

          {order.billing_address && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {t("billingAddress")}
              </h3>
              <AddressBlock address={order.billing_address} />
            </div>
          )}
        </div>

        {order.email && (
          <div className="px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t("confirmationSentTo")}{" "}
              <span className="font-medium text-gray-700">{order.email}</span>
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          size="lg"
          asChild
          className="h-16 rounded-none bg-black px-6 text-xs uppercase tracking-[0.16em] hover:bg-[#d4030a]"
        >
          <Link href={`${basePath}/`} className="flex gap-12">
            {tc("continueShopping")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
