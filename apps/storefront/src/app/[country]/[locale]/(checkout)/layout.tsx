"use client";

import { ArrowLeft, ChevronDown, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  CheckoutProvider,
  CheckoutSummary,
  useCheckout,
} from "@/contexts/CheckoutContext";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { getStoreName } from "@/lib/store";
import { extractBasePath } from "@/lib/utils/path";

const storeName = getStoreName();

function CheckoutHeader() {
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const t = useTranslations("checkoutLayout");
  return (
    <header className="flex h-16 items-center justify-between">
      <Link
        href={basePath || "/"}
        className="flex items-baseline gap-2"
        aria-label={storeName}
      >
        <span className="text-lg font-black uppercase tracking-[-0.05em]">
          Mile27
        </span>
        <span className="text-[8px] uppercase tracking-[0.24em] text-black/45">
          Secure checkout
        </span>
      </Link>
      <Link
        href={basePath || "/"}
        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-black/50 hover:text-black"
        aria-label={t("backToStore")}
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {t("backToStore")}
      </Link>
    </header>
  );
}

function CheckoutFooter() {
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const t = useTranslations("checkoutLayout");
  const tp = useTranslations("policies");
  return (
    <footer className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-black/15 py-5 text-[9px] uppercase tracking-[0.12em] text-black/45">
      <p>
        {t("allRightsReserved", { year: new Date().getFullYear(), storeName })}
      </p>
      {POLICY_LINKS.map((policy) => (
        <Link
          key={policy.slug}
          href={`${basePath}/policies/${policy.slug}`}
          target="_blank"
          className="underline hover:text-black"
        >
          {tp(policy.nameKey)}
        </Link>
      ))}
    </footer>
  );
}

function MobileSummaryToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("checkoutLayout");
  const { summaryContent } = useCheckout();
  if (summaryContent === null) return null;
  return (
    <div className="border-b border-black/15 bg-[#f2f2ef] lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={isOpen}
        aria-controls="checkout-summary-panel"
      >
        <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em]">
          <ShoppingBag className="h-4 w-4" />
          {isOpen ? t("hideOrderSummary") : t("showOrderSummary")}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div id="checkout-summary-panel" className="px-5 pb-5">
          <CheckoutSummary />
        </div>
      )}
    </div>
  );
}

function CheckoutLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConfirmation = pathname.includes("/order-placed/");

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f5] text-[#0a0a0a]">
      <div className="border-b border-black/15 lg:hidden">
        <div className="px-5">
          <CheckoutHeader />
        </div>
      </div>
      <MobileSummaryToggle />
      <div
        className={`grid flex-1 grid-cols-1 ${isConfirmation ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(380px,34vw)]"}`}
      >
        <div className="flex flex-col lg:border-r lg:border-black/15">
          <div className="flex-1 px-5 py-6 sm:px-8 lg:px-[clamp(3rem,7vw,8rem)] lg:py-10">
            <div className="mb-16 hidden lg:block">
              <CheckoutHeader />
            </div>
            <div className="mb-10 border-b border-black/15 pb-8">
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#d4030a]">
                Purchase workspace / {isConfirmation ? "03" : "02"}
              </p>
              <h1 className="mt-5 text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.82] tracking-[-0.07em]">
                {isConfirmation ? "Ride" : "Finalise"}
                <br />
                {isConfirmation ? "confirmed." : "the ride."}
              </h1>
              {!isConfirmation && (
                <div className="mt-8 flex gap-5 text-[9px] uppercase tracking-[0.16em] text-black/40">
                  <span className="text-black">01 Address</span>
                  <span>02 Delivery</span>
                  <span>03 Payment</span>
                </div>
              )}
            </div>
            {children}
          </div>
          <div className="px-5 pb-4 sm:px-8 lg:px-[clamp(3rem,7vw,8rem)]">
            <CheckoutFooter />
          </div>
        </div>
        <aside
          className={`hidden bg-white ${isConfirmation ? "" : "lg:block"}`}
        >
          <div className="sticky top-0 px-10 py-10">
            <p className="mb-8 border-b border-black/15 pb-4 text-[9px] uppercase tracking-[0.22em]">
              Order manifest
            </p>
            <CheckoutSummary />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CheckoutProvider>
      <CheckoutLayoutContent>{children}</CheckoutLayoutContent>
    </CheckoutProvider>
  );
}
