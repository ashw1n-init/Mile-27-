"use client";

import type {
  AvailabilityFilter,
  OptionFilter,
  ProductFiltersResponse,
} from "@spree/sdk";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  getActiveFilterCount,
  getAvailabilityLabel,
  getOptionValueLabel,
  parseCompoundOptionValue,
} from "@/lib/utils/filters";
import type { PriceBucket } from "@/lib/utils/price-buckets";
import { findMatchingBucket } from "@/lib/utils/price-buckets";
import {
  type ActiveFilters,
  type AvailabilityStatus,
  isAvailabilityStatus,
} from "@/types/filters";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filtersData: ProductFiltersResponse | null;
  activeFilters: ActiveFilters;
  priceBuckets: PriceBucket[];
  onApply: (filters: ActiveFilters) => void;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filtersData,
  activeFilters,
  priceBuckets,
  onApply,
}: MobileFilterDrawerProps) {
  const t = useTranslations("products");
  const [stagedFilters, setStagedFilters] =
    useState<ActiveFilters>(activeFilters);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only sync when the drawer opens, not when activeFilters changes while open
  useEffect(() => {
    if (isOpen) {
      setStagedFilters(activeFilters);
    }
  }, [isOpen]);

  const handleOptionValueToggle = useCallback((optionValueId: string) => {
    setStagedFilters((prev) => {
      const newOptionValues = prev.optionValues.includes(optionValueId)
        ? prev.optionValues.filter((id) => id !== optionValueId)
        : [...prev.optionValues, optionValueId];
      return { ...prev, optionValues: newOptionValues };
    });
  }, []);

  const handlePriceChange = useCallback((min?: number, max?: number) => {
    setStagedFilters((prev) => ({ ...prev, priceMin: min, priceMax: max }));
  }, []);

  const handleAvailabilityChange = useCallback((value?: AvailabilityStatus) => {
    setStagedFilters((prev) => ({ ...prev, availability: value }));
  }, []);

  const handleClearAll = useCallback(() => {
    setStagedFilters((prev) => ({
      optionValues: [],
      priceMin: undefined,
      priceMax: undefined,
      availability: undefined,
      sortBy: prev.sortBy,
    }));
  }, []);

  const handleApply = useCallback(() => {
    onApply(stagedFilters);
    onClose();
  }, [stagedFilters, onApply, onClose]);

  const stagedCount = getActiveFilterCount(stagedFilters);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="inset-x-2 bottom-[calc(env(safe-area-inset-bottom)+5rem)] mx-auto flex max-h-[min(78dvh,52rem)] w-auto max-w-[72rem] flex-col gap-0 overflow-hidden border border-[#d8d8d2] bg-white p-0 shadow-[0_28px_90px_rgba(11,11,10,0.18)] sm:inset-x-4 sm:bottom-[calc(env(safe-area-inset-bottom)+5.75rem)]"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">{t("filters")}</SheetTitle>

        <div className="flex items-center justify-between border-b border-[#d8d8d2] px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="size-4" strokeWidth={1.5} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#66645f]">
                Selection matrix
              </p>
              <h2 className="mt-0.5 text-lg font-medium tracking-[-0.03em] text-[#0b0b0a]">
                {t("filters")}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeFilters")}
            className="grid size-11 place-items-center border border-transparent transition-colors hover:border-[#d8d8d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b0b0a]"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-x-10 gap-y-8 overflow-y-auto overscroll-contain p-5 sm:p-7 md:grid-cols-2 lg:grid-cols-3">
          {filtersData?.filters.map((filter) => {
            switch (filter.type) {
              case "option":
                return (
                  <MobileOptionSection
                    key={filter.id}
                    filter={filter as OptionFilter}
                    selectedValues={stagedFilters.optionValues}
                    onToggle={handleOptionValueToggle}
                  />
                );
              case "price_range":
                return (
                  <MobilePriceSection
                    key={filter.id}
                    priceBuckets={priceBuckets}
                    activeFilters={stagedFilters}
                    onPriceChange={handlePriceChange}
                  />
                );
              case "availability":
                return (
                  <MobileAvailabilitySection
                    key={filter.id}
                    filter={filter as AvailabilityFilter}
                    selected={stagedFilters.availability}
                    onChange={handleAvailabilityChange}
                  />
                );
              default:
                return null;
            }
          })}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#d8d8d2] bg-[#f4f4f0] p-3 sm:flex-row sm:items-center sm:justify-end sm:p-4">
          {stagedCount > 0 && (
            <Button
              variant="ghost"
              className="h-11 w-full rounded-none px-5 sm:w-auto"
              onClick={handleClearAll}
            >
              {t("clearAllFiltersCount", { count: stagedCount })}
            </Button>
          )}
          <Button
            className="h-11 w-full rounded-none bg-[#0b0b0a] px-7 text-white hover:bg-[#292927] sm:w-auto"
            onClick={handleApply}
          >
            {t("showResults")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileOptionSection({
  filter,
  selectedValues,
  onToggle,
}: {
  filter: OptionFilter;
  selectedValues: string[];
  onToggle: (id: string) => void;
}) {
  const isColorFilter =
    filter.kind === "color_swatch" || /^colou?r$/i.test(filter.label.trim());
  const compoundOptions = filter.options.map((option) => ({
    option,
    parts: parseCompoundOptionValue(option.label),
  }));
  const isCompoundColourFilter = compoundOptions.some(
    (entry) => entry.parts !== null,
  );

  if (isCompoundColourFilter) {
    return (
      <CompoundColourScale
        filter={filter}
        selectedValues={selectedValues}
        onToggle={onToggle}
      />
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {filter.label}
      </h3>
      {isColorFilter ? (
        <ColourScale
          filter={filter}
          selectedValues={selectedValues}
          onToggle={onToggle}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {filter.options.map((option) => {
            const isSelected = selectedValues.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggle(option.id)}
                className={`px-3.5 py-2 text-sm rounded-xl border transition-colors ${
                  isSelected
                    ? "border-gray-500 bg-primary text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {getOptionValueLabel(option.label)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ColourScale({
  filter,
  selectedValues,
  onToggle,
}: {
  filter: OptionFilter;
  selectedValues: string[];
  onToggle: (id: string) => void;
}) {
  const selectedNames = filter.options
    .filter((option) => selectedValues.includes(option.id))
    .map((option) => option.label)
    .join(", ");

  return (
    <fieldset>
      <legend className="sr-only">{filter.label}</legend>
      <div className="mb-4 min-h-5 text-xs text-[#66645f]">
        {selectedNames || "Choose a colour"}
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filter.options.map((option) => {
          const selected = selectedValues.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              aria-label={`${option.label}, ${option.count} products`}
              title={option.label}
              onClick={() => onToggle(option.id)}
              className="group min-w-0 text-left focus-visible:outline-none"
            >
              <span
                className={`relative block aspect-square w-full overflow-hidden border transition-[border-color,transform] duration-200 group-hover:scale-[1.04] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#0b0b0a] ${
                  selected
                    ? "border-[#0b0b0a] ring-2 ring-[#0b0b0a] ring-offset-2"
                    : "border-[#c8c8c2]"
                }`}
                style={getColourSwatchStyle(
                  option.label,
                  option.color_code,
                  option.image_url,
                )}
              >
                {selected && (
                  <span className="absolute inset-0 grid place-items-center bg-black/10">
                    <span className="grid size-5 place-items-center bg-white text-[#0b0b0a] shadow-[0_1px_4px_rgba(0,0,0,0.18)]">
                      <Check className="size-3.5" strokeWidth={2} />
                    </span>
                  </span>
                )}
              </span>
              <span className="mt-1.5 block truncate text-[10px] leading-tight text-[#66645f] group-hover:text-[#0b0b0a]">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function CompoundColourScale({
  filter,
  selectedValues,
  onToggle,
}: {
  filter: OptionFilter;
  selectedValues: string[];
  onToggle: (id: string) => void;
}) {
  const entries = filter.options.flatMap((option) => {
    const parts = parseCompoundOptionValue(option.label);
    return parts ? [{ option, parts }] : [];
  });
  const sizes = [...new Set(entries.map(({ parts }) => parts.size))];
  const initiallySelected = entries.find(({ option }) =>
    selectedValues.includes(option.id),
  );
  const [activeSize, setActiveSize] = useState(
    initiallySelected?.parts.size ?? sizes[0] ?? "",
  );
  const visibleColours = entries.filter(
    ({ parts }) => parts.size === activeSize,
  );
  const selectedNames = visibleColours
    .filter(({ option }) => selectedValues.includes(option.id))
    .map(({ parts }) => parts.color)
    .join(", ");

  return (
    <div className="md:col-span-2 lg:col-span-3">
      <div className="mb-5 flex items-end justify-between border-b border-[#d8d8d2] pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#77756f]">
            Variant scale
          </p>
          <h3 className="mt-1 text-base font-medium tracking-[-0.025em] text-[#0b0b0a]">
            Size and colour
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#77756f]">
          {
            selectedValues.filter((id) =>
              filter.options.some((option) => option.id === id),
            ).length
          }{" "}
          selected
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(12rem,0.7fr)_minmax(18rem,1.3fr)]">
        <fieldset>
          <legend className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#77756f]">
            01 / Size
          </legend>
          <div className="grid grid-cols-4 border-l border-t border-[#d8d8d2] sm:grid-cols-6 lg:grid-cols-4">
            {sizes.map((size) => {
              const active = size === activeSize;
              const hasSelection = entries.some(
                ({ option, parts }) =>
                  parts.size === size && selectedValues.includes(option.id),
              );
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveSize(size)}
                  className={`relative grid min-h-12 place-items-center border-b border-r border-[#d8d8d2] font-mono text-xs font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#0b0b0a] ${
                    active
                      ? "bg-[#0b0b0a] text-white"
                      : "bg-white text-[#0b0b0a] hover:bg-[#f4f4f0]"
                  }`}
                >
                  {size}
                  {hasSelection && !active && (
                    <span className="absolute right-1.5 top-1.5 size-1.5 bg-[#ff4d20]" />
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 flex w-full items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#77756f]">
              02 / Colour scale
            </span>
            <span className="truncate text-xs text-[#66645f]">
              {selectedNames || "Choose a finish"}
            </span>
          </legend>
          <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
            {visibleColours.map(({ option, parts }) => {
              const selected = selectedValues.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${activeSize}, ${parts.color}, ${option.count} products`}
                  title={parts.color}
                  onClick={() => onToggle(option.id)}
                  className="group min-w-0 text-left focus-visible:outline-none"
                >
                  <span
                    className={`relative block aspect-square w-full overflow-hidden border transition-[border-color,transform] duration-200 group-hover:scale-[1.04] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#0b0b0a] ${
                      selected
                        ? "border-[#0b0b0a] ring-2 ring-[#0b0b0a] ring-offset-2"
                        : "border-[#c8c8c2]"
                    }`}
                    style={getColourSwatchStyle(
                      parts.color,
                      option.color_code,
                      option.image_url,
                    )}
                  >
                    {selected && (
                      <span className="absolute inset-0 grid place-items-center bg-black/10">
                        <span className="grid size-5 place-items-center bg-white text-[#0b0b0a] shadow-[0_1px_4px_rgba(0,0,0,0.18)]">
                          <Check className="size-3.5" strokeWidth={2} />
                        </span>
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 block truncate text-[10px] leading-tight text-[#66645f] group-hover:text-[#0b0b0a]">
                    {parts.color}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function getColourSwatchStyle(
  colorName: string,
  colorCode?: string | null,
  imageUrl?: string | null,
): React.CSSProperties {
  if (imageUrl) {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
    };
  }
  if (colorCode) return { backgroundColor: colorCode };

  const segments = colorName
    .split("/")
    .map((segment) => getNamedColour(segment.trim()));
  if (segments.length > 1) {
    const stopSize = 100 / segments.length;
    const stops = segments.flatMap((color, index) => [
      `${color} ${index * stopSize}%`,
      `${color} ${(index + 1) * stopSize}%`,
    ]);
    return { backgroundImage: `linear-gradient(135deg, ${stops.join(", ")})` };
  }

  const name = colorName.toLowerCase();
  if (name.includes("clear") || name.includes("photochromic")) {
    return {
      backgroundColor: "#f7f8f6",
      backgroundImage:
        "linear-gradient(135deg, rgba(148,163,184,.28) 25%, transparent 25%, transparent 75%, rgba(148,163,184,.28) 75%), linear-gradient(135deg, rgba(148,163,184,.28) 25%, transparent 25%, transparent 75%, rgba(148,163,184,.28) 75%)",
      backgroundPosition: "0 0, 8px 8px",
      backgroundSize: "16px 16px",
    };
  }
  return { backgroundColor: getNamedColour(colorName) };
}

function getNamedColour(colorName: string): string {
  const name = colorName.toLowerCase();
  if (name.includes("white")) return "#f4f4f1";
  if (name.includes("yellow") || name.includes("hi-viz")) return "#e7ef32";
  if (name.includes("lime")) return "#84b547";
  if (name.includes("orange")) return "#d96a2b";
  if (name.includes("red noise")) return "#9b3b35";
  if (name.includes("red")) return "#b53b36";
  if (name.includes("army green")) return "#59634b";
  if (name.includes("green")) return "#52715b";
  if (name.includes("basalt blue")) return "#536a78";
  if (name.includes("blue")) return "#315271";
  if (name.includes("silver") || name.includes("titanium")) return "#a4a7a5";
  if (name.includes("smoke")) return "#656a6c";
  if (name.includes("grey") || name.includes("gray")) return "#777b7c";
  if (name.includes("black") || name.includes("stealth")) return "#171817";
  if (name.includes("camo") || name.includes("special ops")) return "#4e5448";
  return "#9faaae";
}

function MobilePriceSection({
  priceBuckets,
  activeFilters,
  onPriceChange,
}: {
  priceBuckets: PriceBucket[];
  activeFilters: ActiveFilters;
  onPriceChange: (min?: number, max?: number) => void;
}) {
  const t = useTranslations("products");

  if (priceBuckets.length === 0) return null;

  const selectedBucket = findMatchingBucket(
    priceBuckets,
    activeFilters.priceMin,
    activeFilters.priceMax,
  );

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {t("price")}
      </h3>
      <div className="space-y-1">
        {priceBuckets.map((bucket) => {
          const isSelected = selectedBucket?.id === bucket.id;
          return (
            <button
              key={bucket.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                if (isSelected) {
                  onPriceChange(undefined, undefined);
                } else {
                  onPriceChange(bucket.min, bucket.max);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${
                isSelected
                  ? "bg-gray-50 font-medium text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="flex-1 text-left">{bucket.label}</span>
              {isSelected && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileAvailabilitySection({
  filter,
  selected,
  onChange,
}: {
  filter: AvailabilityFilter;
  selected?: AvailabilityStatus;
  onChange: (value?: AvailabilityStatus) => void;
}) {
  const t = useTranslations("products");

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {t("availability")}
      </h3>
      <div className="space-y-1">
        {filter.options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                if (isSelected) {
                  onChange(undefined);
                } else if (isAvailabilityStatus(option.id)) {
                  onChange(option.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${
                isSelected
                  ? "bg-gray-50 font-medium text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="flex-1 text-left">
                {getAvailabilityLabel(option.id, t)}
              </span>
              <span className="text-xs text-gray-400">({option.count})</span>
              {isSelected && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
