"use client";

import type { LineItem } from "@spree/sdk";
import { ArrowRight, Loader2, Minus, Plus, ShieldCheck, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { TactileDisc } from "@/components/ui/tactile-disc";
import { useCart } from "@/contexts/CartContext";
import { trackRemoveFromCart, trackViewCart } from "@/lib/analytics/gtm";
import {
  getPurchaseGuidance,
  type PurchaseGuidance,
} from "@/lib/data/purchase-guidance";
import { extractBasePath } from "@/lib/utils/path";
import { playTactilePress } from "@/lib/utils/tactile-feedback";

const ExpressCheckoutButton = dynamic(
  () =>
    import("@/components/checkout/ExpressCheckoutButton").then((m) => ({
      default: m.ExpressCheckoutButton,
    })),
  { ssr: false },
);

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [expressProcessing, setExpressProcessing] = useState(false);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<PurchaseGuidance[]>([]);
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const viewCartFiredRef = useRef(false);
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const guidanceKey = cart?.items
    ?.map((item) => item.slug)
    .sort()
    .join("|");

  useEffect(() => {
    if (
      !loading &&
      cart &&
      cart.total_quantity > 0 &&
      !viewCartFiredRef.current
    ) {
      trackViewCart(cart);
      viewCartFiredRef.current = true;
    }
  }, [cart, loading]);

  useEffect(() => {
    if (!guidanceKey) return;
    let cancelled = false;
    getPurchaseGuidance(guidanceKey.split("|")).then((entries) => {
      if (!cancelled) setGuidance(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [guidanceKey]);

  const changeQuantity = async (item: LineItem, quantity: number) => {
    setPendingItem(item.id);
    try {
      await updateItem(item.id, quantity);
    } finally {
      setPendingItem(null);
    }
  };

  const handleRemove = async (item: LineItem) => {
    setPendingItem(item.id);
    try {
      await removeItem(item.id);
      if (cart) trackRemoveFromCart(item, cart.currency);
    } finally {
      setPendingItem(null);
    }
  };

  if (loading) return <CartSkeleton />;

  if (!cart?.items?.length) {
    return (
      <main className="min-h-[72vh] border-t border-black/15 px-5 py-16 sm:px-8 lg:px-14">
        <p className="text-[10px] uppercase tracking-[0.28em] text-black/45">
          Purchase workspace / 00
        </p>
        <div className="mx-auto flex max-w-3xl flex-col items-center py-24 text-center">
          <p className="text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.88] tracking-[-0.07em]">
            Nothing queued.
          </p>
          <p className="mt-6 max-w-md text-sm leading-6 text-black/55">
            {t("emptyCartDescription")}
          </p>
          <Link
            href={`${basePath}/products`}
            className="group mt-10 flex min-h-14 items-center gap-16 border border-black bg-black px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#d4030a]"
          >
            {tc("continueShopping")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="border-t border-black/15 bg-[#f7f7f5] text-[#0a0a0a]">
      <header className="border-b border-black/15 px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-black/45">
              Purchase workspace / 01
            </p>
            <h1 className="text-[clamp(3.5rem,8vw,8.5rem)] font-medium leading-[0.78] tracking-[-0.075em]">
              Your kit.
            </h1>
          </div>
          <p className="hidden max-w-56 text-right text-xs leading-5 text-black/55 md:block">
            Review the exact configuration before delivery and payment.
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,31vw)]">
        <section
          aria-label={t("shoppingCart")}
          className="border-black/15 lg:border-r"
        >
          <div className="grid grid-cols-[40px_1fr_auto] border-b border-black/15 px-5 py-3 text-[9px] uppercase tracking-[0.22em] text-black/45 sm:px-8 lg:px-14">
            <span>No.</span>
            <span>Equipment</span>
            <span>Total</span>
          </div>
          <ol>
            {cart.items.map((item, index) => (
              <li
                key={item.id}
                className="grid grid-cols-[40px_1fr] border-b border-black/15 px-5 py-7 sm:px-8 lg:grid-cols-[40px_180px_minmax(0,1fr)_auto] lg:px-14 lg:py-9"
              >
                <span className="pt-1 text-[10px] tracking-[0.18em] text-[#d4030a]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative aspect-square w-full max-w-[180px] bg-white">
                  <ProductImage
                    src={item.thumbnail_url}
                    alt={item.name}
                    fill
                    className="object-contain p-3"
                    sizes="180px"
                  />
                </div>
                <div className="col-start-2 mt-5 min-w-0 lg:col-start-auto lg:mt-0 lg:px-8">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-black/40">
                    Configured equipment
                  </p>
                  <h2 className="mt-2 max-w-xl text-xl font-medium leading-tight tracking-[-0.03em] sm:text-2xl">
                    {item.name}
                  </h2>
                  {item.options_text && (
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-black/50">
                      {item.options_text}
                    </p>
                  )}
                  <p className="mt-3 text-sm tabular-nums">
                    {item.display_price}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-5">
                    <div className="flex h-11 items-center border border-black/20 bg-transparent">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        disabled={pendingItem === item.id || item.quantity <= 1}
                        onClick={() => changeQuantity(item, item.quantity - 1)}
                        className="grid h-full w-11 place-items-center transition-colors hover:bg-black hover:text-white disabled:opacity-25"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="grid h-full min-w-11 place-items-center border-x border-black/20 text-xs tabular-nums">
                        {pendingItem === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        disabled={pendingItem === item.id}
                        onClick={() => changeQuantity(item, item.quantity + 1)}
                        className="grid h-full w-11 place-items-center transition-colors hover:bg-black hover:text-white disabled:opacity-25"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={pendingItem === item.id}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-black/50 underline-offset-4 hover:text-[#d4030a] hover:underline"
                    >
                      <X className="h-3.5 w-3.5" />
                      {tc("remove")}
                    </button>
                  </div>
                </div>
                <p className="col-start-2 row-start-2 mt-5 text-right text-lg font-medium tabular-nums lg:col-start-4 lg:row-start-1 lg:mt-0">
                  {item.display_total}
                </p>
              </li>
            ))}
          </ol>

          {guidance.length > 0 && (
            <section className="border-b border-black/15 px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
              <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-[#d4030a]">
                    Verified compatibility
                  </p>
                  <h2 className="mt-3 text-3xl font-medium tracking-[-0.05em]">
                    Complete the system.
                  </h2>
                </div>
                <p className="hidden max-w-52 text-right text-xs leading-5 text-black/45 sm:block">
                  Curated against the exact equipment in your cart.
                </p>
              </div>
              <div className="grid gap-px bg-black/15 sm:grid-cols-2">
                {guidance.slice(0, 4).map((entry) => (
                  <Link
                    key={entry.id}
                    href={`${basePath}/products/${entry.product.slug}`}
                    className="group grid grid-cols-[112px_1fr] bg-white"
                  >
                    <div className="relative aspect-square bg-[#f7f7f5]">
                      <ProductImage
                        src={entry.product.image_url}
                        alt={entry.product.name}
                        fill
                        className="object-contain p-2"
                        sizes="112px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col p-4">
                      <p className="text-[8px] uppercase tracking-[0.18em] text-black/40">
                        {entry.role.replaceAll("_", " ")}
                      </p>
                      <h3 className="mt-2 text-sm font-medium">
                        {entry.product.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/50">
                        {entry.rationale}
                      </p>
                      <ArrowRight className="mt-auto h-4 w-4 self-end transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-px bg-black/15 sm:grid-cols-3">
            {[
              ["01", "Address", "Set the destination"],
              ["02", "Delivery", "Choose an available service"],
              ["03", "Payment", "Complete securely"],
            ].map(([number, label, copy]) => (
              <div key={number} className="bg-[#f7f7f5] p-6 lg:p-8">
                <span className="text-[9px] tracking-[0.2em] text-[#d4030a]">
                  {number}
                </span>
                <p className="mt-8 text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs text-black/45">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="relative bg-white">
          <div className="sticky top-0 p-5 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between border-b border-black/15 pb-5">
              <p className="text-[10px] uppercase tracking-[0.22em]">
                Commitment
              </p>
              <p className="text-[10px] tabular-nums text-black/45">
                {String(cart.total_quantity).padStart(2, "0")} units
              </p>
            </div>
            <dl className="space-y-3 py-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-black/55">{tc("subtotal")}</dt>
                <dd>{cart.display_item_total}</dd>
              </div>
              {cart.discount_total && parseFloat(cart.discount_total) < 0 && (
                <div className="flex justify-between text-[#d4030a]">
                  <dt>{tc("discount")}</dt>
                  <dd>{cart.display_discount_total}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-black/55">Delivery</dt>
                <dd className="text-right text-xs text-black/45">
                  Calculated after address
                </dd>
              </div>
            </dl>
            <div className="border-y border-black/15 py-7">
              <div className="flex items-end justify-between gap-4">
                <dt className="text-[10px] uppercase tracking-[0.2em]">
                  {tc("total")}
                </dt>
                <dd className="text-[clamp(2.5rem,4vw,4.5rem)] font-medium leading-none tracking-[-0.06em] tabular-nums">
                  {cart.display_total}
                </dd>
              </div>
              <p className="mt-3 text-right text-[9px] uppercase tracking-[0.18em] text-black/40">
                {cart.currency} · taxes confirmed at checkout
              </p>
            </div>
            <div className="mt-7 space-y-3">
              {parseFloat(cart.total ?? "0") > 0 && (
                <ExpressCheckoutButton
                  cart={cart}
                  basePath={basePath}
                  onComplete={() => {}}
                  onProcessingChange={setExpressProcessing}
                />
              )}
              {!expressProcessing && (
                <Link
                  href={`${basePath}/checkout/${cart.id}`}
                  onPointerDown={(event) =>
                    playTactilePress(event.currentTarget)
                  }
                  className="group relative flex h-16 w-full items-center justify-between overflow-hidden bg-black px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#d4030a]"
                >
                  <TactileDisc />
                  Proceed to checkout
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
            <div className="mt-7 flex gap-3 border-t border-black/15 pt-5 text-xs leading-5 text-black/50">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Payment is encrypted. Inventory and delivery availability are
                revalidated before payment.
              </p>
            </div>
            <Link
              href={`${basePath}/products`}
              className="mt-8 inline-block text-[10px] uppercase tracking-[0.16em] underline underline-offset-4"
            >
              {tc("continueShopping")}
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CartSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-12 sm:px-8 lg:px-14">
      <div className="animate-pulse">
        <div className="h-3 w-44 bg-black/10" />
        <div className="mt-12 h-24 w-2/3 bg-black/10" />
        <div className="mt-16 grid gap-8 border-t border-black/10 py-8 sm:grid-cols-[180px_1fr]">
          <div className="aspect-square bg-black/10" />
          <div className="space-y-4">
            <div className="h-7 w-3/4 bg-black/10" />
            <div className="h-4 w-1/3 bg-black/10" />
          </div>
        </div>
      </div>
    </main>
  );
}
