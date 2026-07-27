"use client";

import type { Category } from "@spree/sdk";
import { ArrowLeft, Check, ChevronRight, User, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { useStore } from "@/contexts/StoreContext";
import { useCountrySwitch } from "@/hooks/useCountrySwitch";

// Convert ISO country code to flag emoji
function countryToFlag(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return "";
  const firstChar = code.charCodeAt(0) - 65 + 0x1f1e6;
  const secondChar = code.charCodeAt(1) - 65 + 0x1f1e6;
  return String.fromCodePoint(firstChar, secondChar);
}

type PanelType =
  | { kind: "main" }
  | { kind: "category"; category: Category }
  | { kind: "country" };

interface MobileMenuProps {
  rootCategories: Category[];
  basePath: string;
  /** Whether the wholesale addon is enabled — gates the trade portal link. */
  wholesaleEnabled: boolean;
}

export function MobileMenu({
  rootCategories,
  basePath,
  wholesaleEnabled,
}: MobileMenuProps) {
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);
  const [panelStack, setPanelStack] = useState<PanelType[]>([{ kind: "main" }]);
  // animatedIndex trails panelStack — new panels mount off-screen, then animate in
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { country, currency, countries } = useStore();
  const { isCountryNavigating, handleCountrySelect } = useCountrySwitch({
    currentCountry: country,
    onBeforeNavigate: () => setOpen(false),
  });

  const currentPanel = panelStack[panelStack.length - 1];

  const cancelPendingCallbacks = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const pushPanel = (panel: PanelType) => {
    cancelPendingCallbacks();
    // Step 1: mount the new panel off-screen (translate-x-full) via flushSync
    flushSync(() => {
      setPanelStack((prev) => [...prev, panel]);
    });
    // Step 2: on next frame, update animatedIndex to trigger slide-in
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setAnimatedIndex((prev) => prev + 1);
    });
  };

  const popPanel = () => {
    cancelPendingCallbacks();
    // Step 1: animate out by decrementing animatedIndex
    setAnimatedIndex((prev) => Math.max(0, prev - 1));
    // Step 2: after transition, remove the panel from the stack
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setPanelStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    }, 300);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      cancelPendingCallbacks();
      setPanelStack([{ kind: "main" }]);
      setAnimatedIndex(0);
    }
  };

  // Shared link style
  const linkClass =
    "block min-w-0 max-w-full whitespace-normal [overflow-wrap:anywhere] text-left text-[clamp(2.15rem,9vw,3.25rem)] font-medium leading-[0.94] tracking-[-0.06em] text-zinc-950/45 transition-colors duration-300 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a] sm:text-[clamp(2.25rem,4vw,3rem)]";

  // Shared button style for items with children (chevron)
  const categoryButtonClass =
    "flex w-full min-w-0 items-center justify-between gap-3 whitespace-normal [overflow-wrap:anywhere] text-left text-[clamp(2.15rem,9vw,3.25rem)] font-medium leading-[0.94] tracking-[-0.06em] text-zinc-950/45 transition-colors duration-300 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a] sm:text-[clamp(2.25rem,4vw,3rem)]";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* Animated hamburger / X button — two-phase animation matching Lottie reference */}
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => {
          setOpen(!open);
        }}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        className="relative z-[60] cursor-pointer text-zinc-950 hover:bg-zinc-950/5"
      >
        <div className="relative h-5 w-6">
          {/* Top line: phase 1 translates to center, phase 2 rotates 45° */}
          <span
            className={`absolute left-0 top-[6px] h-px bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "w-6 translate-y-[3px] rotate-45" : "w-6"
            }`}
          />
          {/* Middle line: fades out in phase 1, fades in after delay on close */}
          {/* Bottom line: phase 1 translates to center, phase 2 rotates -45° */}
          <span
            className={`absolute right-0 top-[13px] h-px bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "w-6 -translate-y-[4px] -rotate-45" : "w-3"
            }`}
          />
        </div>
      </Button>

      <SheetContent
        side="left"
        className="flex flex-col !gap-0 !rounded-none !border-0 !bg-white overflow-hidden max-md:!inset-0 max-md:!h-[100dvh] max-md:!w-full max-md:!max-w-none"
        showCloseButton={false}
        overlayClassName="!bg-zinc-950/15 backdrop-blur-sm"
      >
        <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
        {/* Menu header — changes based on active panel */}
        <div className="relative flex h-16 items-center justify-between overflow-hidden border-b border-gray-200 px-4">
          {/* "Menu" title — visible when on main panel */}
          <span
            className={`text-base font-semibold transition-all duration-300 ease-in-out absolute left-4 ${
              currentPanel.kind === "main"
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0 pointer-events-none"
            }`}
          >
            {t("menu")}
          </span>
          {/* Back button + category name — visible on sub-panels */}
          <button
            type="button"
            onClick={popPanel}
            className={`flex items-center gap-2 text-gray-700 hover:text-gray-900 text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out absolute left-4 ${
              currentPanel.kind !== "main"
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0 pointer-events-none"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>
              {currentPanel.kind === "category"
                ? currentPanel.category.name
                : currentPanel.kind === "country"
                  ? t("selectCountry")
                  : ""}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            className="cursor-pointer ml-auto"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Sliding panels container */}
        <div className="relative flex-1 overflow-hidden">
          {/* Main menu panel */}
          <div
            className={`absolute inset-0 flex flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              animatedIndex === 0 && currentPanel.kind === "main"
                ? "translate-x-0"
                : "-translate-x-full"
            }`}
          >
            <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
              <Link
                href={basePath || "/"}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {t("home")}
              </Link>
              <Link
                href={`${basePath}/products`}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {t("allProducts")}
              </Link>
              {rootCategories.map((category) =>
                category.children && category.children.length > 0 ? (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => pushPanel({ kind: "category", category })}
                    className={categoryButtonClass}
                  >
                    <span className="min-w-0 flex-1">{category.name}</span>
                    <ChevronRight className="size-4 shrink-0 text-gray-400" />
                  </button>
                ) : (
                  <Link
                    key={category.id}
                    href={`${basePath}/c/${category.permalink}`}
                    onClick={() => setOpen(false)}
                    className={linkClass}
                  >
                    {category.name}
                  </Link>
                ),
              )}
              <Link
                href={`${basePath}/#contact`}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {t("contact")}
              </Link>

              {/* Secondary group — kept out of the category list above.
                  Only shown when the wholesale addon is enabled. */}
              {wholesaleEnabled && (
                <div className="mt-4 pt-5 border-t border-zinc-950/15">
                  <Link
                    href={`${basePath}/wholesale`}
                    onClick={() => setOpen(false)}
                    className={`${linkClass} block`}
                  >
                    {t("wholesale")}
                  </Link>
                </div>
              )}
            </nav>

            {/* Footer: Country switcher (mobile + tablet) + Account (mobile only) */}
            <SheetFooter className="mt-auto !p-5 sm:!p-8 lg:hidden border-t border-zinc-950/15 pt-4 gap-2">
              <button
                type="button"
                onClick={() => pushPanel({ kind: "country" })}
                className="flex w-full items-center gap-2 py-2.5 text-sm text-zinc-600 transition-colors hover:text-zinc-950"
              >
                <span className="text-lg leading-none">
                  {countryToFlag(country)}
                </span>
                <span className="font-medium">{country.toUpperCase()}</span>
                <span className="text-gray-400">|</span>
                <span>{currency}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>

              <SheetClose asChild className="md:hidden">
                <Link
                  href={`${basePath}/account`}
                  className="flex items-center justify-center gap-2 mb-2 px-4 py-3 bg-zinc-950 text-white text-base font-medium transition-transform active:scale-[0.98]"
                >
                  <User className="size-5" />
                  <span>{t("myAccount")}</span>
                </Link>
              </SheetClose>
            </SheetFooter>
          </div>

          {/* Category sub-panels — one for each level in the stack */}
          {panelStack.map((panel, index) => {
            if (panel.kind !== "category") return null;
            const isAnimatedIn = index <= animatedIndex;
            let translateClass = "translate-x-full";
            if (isAnimatedIn && index < panelStack.length - 1)
              translateClass = "-translate-x-full";
            else if (isAnimatedIn) translateClass = "translate-x-0";

            return (
              <div
                key={`cat-${panel.category.id}-${index}`}
                className={`absolute inset-0 flex flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${translateClass}`}
              >
                {/* Back button (mobile only — desktop uses the global header) */}
                {/* Children */}
                <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pb-10 pt-16 sm:px-8">
                  {panel.category.children?.map((child) =>
                    child.children && child.children.length > 0 ? (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() =>
                          pushPanel({ kind: "category", category: child })
                        }
                        className={categoryButtonClass}
                      >
                        <span className="min-w-0 flex-1">{child.name}</span>
                        <ChevronRight className="size-4 shrink-0 text-gray-400" />
                      </button>
                    ) : (
                      <Link
                        key={child.id}
                        href={`${basePath}/c/${child.permalink}`}
                        onClick={() => handleOpenChange(false)}
                        className={linkClass}
                      >
                        {child.name}
                      </Link>
                    ),
                  )}
                </nav>

                {/* "View all" at the bottom */}
                <div className="border-t border-gray-200 px-4 py-3">
                  <Link
                    href={`${basePath}/c/${panel.category.permalink}`}
                    onClick={() => handleOpenChange(false)}
                    className="block w-full text-center text-sm text-gray-500 hover:text-gray-900 py-2 transition-colors"
                  >
                    {t("viewAllCategory", { category: panel.category.name })}
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Country selector panel */}
          <div
            className={`absolute inset-0 flex flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              currentPanel.kind === "country" &&
              animatedIndex === panelStack.length - 1
                ? "translate-x-0"
                : "translate-x-full"
            }`}
          >
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {countries.map((c) => {
                const isSelected =
                  c.iso.toLowerCase() === country.toLowerCase();
                return (
                  <button
                    key={c.iso}
                    type="button"
                    disabled={isCountryNavigating}
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center gap-3 border-b border-[#9faaae] px-3 py-3 text-base transition-colors ${
                      isSelected
                        ? "bg-gray-100 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg leading-none">
                      {countryToFlag(c.iso)}
                    </span>
                    <span className="flex-1 text-left font-medium">
                      {c.name}
                    </span>
                    <span className="text-sm text-gray-500">{c.currency}</span>
                    {isSelected && <Check className="w-4 h-4 text-black" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
