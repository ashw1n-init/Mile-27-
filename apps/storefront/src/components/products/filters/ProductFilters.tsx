"use client";

import type { PriceRangeFilter, ProductFiltersResponse } from "@spree/sdk";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import {
  ArrowDownUp,
  Check,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { JSX } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FilterBarSkeleton } from "@/components/products/filters/FilterBarSkeleton";
import { MobileFilterDrawer } from "@/components/products/filters/MobileFilterDrawer";
import { getActiveFilterCount, getSortLabel } from "@/lib/utils/filters";
import { generatePriceBuckets } from "@/lib/utils/price-buckets";
import type { ActiveFilters } from "@/types/filters";

interface FilterBarProps {
  filtersData: ProductFiltersResponse | null;
  filtersLoading: boolean;
  activeFilters: ActiveFilters;
  totalCount: number;
  onFilterChange: (filters: ActiveFilters) => void;
}

const spring = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.8,
} as const;

export const FilterBar = memo(function FilterBar({
  filtersData,
  filtersLoading,
  activeFilters,
  totalCount,
  onFilterChange,
}: FilterBarProps): JSX.Element | null {
  const t = useTranslations("products");
  const locale = useLocale();
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [panel, setPanel] = useState<"filters" | "sort" | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);
  const [isQuiet, setIsQuiet] = useState(false);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortDialogRef = useRef<HTMLDivElement>(null);

  const wakeDock = useCallback(() => {
    setIsQuiet(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsQuiet(true), 3600);
  }, []);

  useEffect(() => {
    wakeDock();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [wakeDock]);

  useMotionValueEvent(scrollY, "change", (current) => {
    const delta = current - lastScrollY.current;
    if (Math.abs(delta) > 7 && panel === null) {
      setIsCondensed(delta > 0 && current > 160);
      wakeDock();
      lastScrollY.current = current;
    }
  });

  useEffect(() => {
    if (panel !== "sort") return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = sortDialogRef.current;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>("button:not([disabled])"),
      ];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [panel]);

  const priceBuckets = useMemo(() => {
    const priceFilter = filtersData?.filters.find(
      (filter) => filter.type === "price_range",
    ) as PriceRangeFilter | undefined;
    return priceFilter
      ? generatePriceBuckets(
          priceFilter.min,
          priceFilter.max,
          priceFilter.currency,
          { t, locale },
        )
      : [];
  }, [filtersData, locale, t]);

  if (!filtersData) return filtersLoading ? <FilterBarSkeleton /> : null;

  const activeCount = getActiveFilterCount(activeFilters);
  const activeSort = activeFilters.sortBy || filtersData.default_sort;
  const clearFilters = () =>
    onFilterChange({
      optionValues: [],
      priceMin: undefined,
      priceMax: undefined,
      availability: undefined,
      sortBy: activeFilters.sortBy,
    });

  return (
    <>
      <div className="h-3" aria-hidden="true" />

      <AnimatePresence>
        {panel === "sort" && (
          <motion.div
            className="fixed inset-0 z-[89] flex items-end justify-center bg-black/20 p-3 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] backdrop-blur-[2px] md:items-center md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) setPanel(null);
            }}
          >
            <motion.div
              ref={sortDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sort-panel-title"
              className="w-full max-w-[31rem] overflow-hidden border border-[#d8d8d2] bg-white shadow-[0_24px_80px_rgba(11,11,10,0.16)]"
              initial={{ opacity: 0, y: 22, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.99 }}
              transition={reducedMotion ? { duration: 0 } : spring}
            >
              <div className="flex items-center justify-between border-b border-[#d8d8d2] px-5 py-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#66645f]">
                    Order index
                  </p>
                  <h2
                    id="sort-panel-title"
                    className="mt-1 text-lg font-medium tracking-[-0.03em] text-[#0b0b0a]"
                  >
                    {t("sort")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  className="grid size-11 place-items-center border border-transparent transition-colors hover:border-[#d8d8d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b0b0a]"
                  aria-label={t("closeFilters")}
                >
                  <X className="size-5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-2">
                {filtersData.sort_options.map((option, index) => {
                  const selected = activeSort === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        onFilterChange({ ...activeFilters, sortBy: option.id });
                        setPanel(null);
                      }}
                      className="group flex min-h-14 w-full items-center gap-4 border-b border-[#ecece8] px-3 text-left last:border-0 hover:bg-[#f4f4f0] focus-visible:bg-[#f4f4f0] focus-visible:outline-none"
                    >
                      <span className="w-7 font-mono text-[10px] tracking-[0.12em] text-[#8a8984]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[15px] tracking-[-0.02em] text-[#0b0b0a]">
                        {getSortLabel(option.id, t)}
                      </span>
                      <span
                        className={`grid size-6 place-items-center border ${selected ? "border-[#0b0b0a] bg-[#0b0b0a] text-white" : "border-[#c8c8c2]"}`}
                      >
                        {selected && (
                          <Check className="size-3.5" strokeWidth={2} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        aria-label={`${t("filters")} ${t("sort")}`}
        className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex w-fit max-w-[calc(100vw-1rem)] justify-center px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:max-w-[calc(100vw-2rem)] sm:pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        animate={{
          y: isCondensed ? 7 : 0,
          opacity: isQuiet && panel === null ? 0.86 : 1,
        }}
        transition={reducedMotion ? { duration: 0 } : spring}
        onPointerEnter={() => {
          setIsCondensed(false);
          wakeDock();
        }}
        onFocusCapture={() => {
          setIsCondensed(false);
          wakeDock();
        }}
      >
        <motion.div
          layout
          className="flex h-14 items-center border border-black/15 bg-[#0b0b0a]/[0.96] p-1.5 text-white shadow-[0_18px_50px_rgba(11,11,10,0.22)] supports-[backdrop-filter]:backdrop-blur-xl"
          transition={reducedMotion ? { duration: 0 } : spring}
        >
          <DockButton
            label={t("filters")}
            icon={<SlidersHorizontal className="size-4" strokeWidth={1.6} />}
            active={panel === "filters"}
            badge={activeCount}
            condensed={isCondensed}
            onClick={() => setPanel("filters")}
          />
          <span className="mx-1 h-6 w-px bg-white/15" aria-hidden="true" />
          <DockButton
            label={t("sort")}
            icon={<ArrowDownUp className="size-4" strokeWidth={1.6} />}
            active={panel === "sort"}
            condensed={isCondensed}
            onClick={() => setPanel("sort")}
          />
          <div
            className="ml-1 hidden h-10 items-center border-l border-white/15 px-4 sm:flex"
            aria-live="polite"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-white/55">
              {t("productCount", { count: totalCount })}
            </span>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 grid size-10 place-items-center text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
              aria-label={t("clearAllFiltersCount", { count: activeCount })}
            >
              <RotateCcw className="size-4" strokeWidth={1.6} />
            </button>
          )}
        </motion.div>
      </motion.nav>

      <MobileFilterDrawer
        isOpen={panel === "filters"}
        onClose={() => setPanel(null)}
        filtersData={filtersData}
        activeFilters={activeFilters}
        priceBuckets={priceBuckets}
        onApply={(filters) => {
          onFilterChange(filters);
          setPanel(null);
        }}
      />
    </>
  );
});

function DockButton({
  label,
  icon,
  badge,
  active,
  condensed,
  onClick,
}: {
  label: string;
  icon: JSX.Element;
  badge?: number;
  active: boolean;
  condensed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={active}
      onClick={onClick}
      className="flex h-11 min-w-11 items-center justify-center gap-2 px-3 text-[13px] font-medium tracking-[-0.01em] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white sm:px-4"
    >
      {icon}
      <span className={condensed ? "hidden sm:inline" : "inline"}>{label}</span>
      {Boolean(badge) && (
        <span
          className="grid size-5 place-items-center bg-[#ff4d20] font-mono text-[10px] font-semibold text-[#0b0b0a]"
          aria-hidden="true"
        >
          {badge}
        </span>
      )}
      {Boolean(badge) && <span className="sr-only">{badge} active</span>}
    </button>
  );
}
