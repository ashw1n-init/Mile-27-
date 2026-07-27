"use client";

import type { OptionType, Variant } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface VariantPickerProps {
  variants: Variant[];
  optionTypes: OptionType[];
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant | null) => void;
  theme?: "light" | "dark";
}

export function VariantPicker({
  variants,
  optionTypes,
  selectedVariant,
  onVariantChange,
  theme = "light",
}: VariantPickerProps) {
  const t = useTranslations("products");
  const optionValuesMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    optionTypes.forEach((optionType) => {
      map[optionType.id] = new Set();
    });
    variants.forEach((variant) => {
      variant.option_values.forEach((optionValue) => {
        map[optionValue.option_type_id]?.add(optionValue.name);
      });
    });
    return map;
  }, [variants, optionTypes]);

  const selectedOptions = useMemo(() => {
    const options: Record<string, string> = {};
    selectedVariant?.option_values.forEach((value) => {
      options[value.option_type_id] = value.name;
    });
    return options;
  }, [selectedVariant]);

  const { variantOptionMaps, optionValueDetailsMap } = useMemo(() => {
    const maps = variants.map((variant) => {
      const optionsMap: Record<string, string> = {};
      variant.option_values.forEach((value) => {
        optionsMap[value.option_type_id] = value.name;
      });
      return { variant, optionsMap };
    });
    const detailsMap: Record<string, Variant["option_values"][0]> = {};
    variants.forEach((variant) => {
      variant.option_values.forEach((value) => {
        detailsMap[`${value.option_type_id}:${value.name}`] ??= value;
      });
    });
    return { variantOptionMaps: maps, optionValueDetailsMap: detailsMap };
  }, [variants]);

  const findVariant = (newOptions: Record<string, string>): Variant | null =>
    variantOptionMaps.find(
      ({ variant, optionsMap }) =>
        variant.option_values.length === Object.keys(newOptions).length &&
        Object.entries(newOptions).every(
          ([typeId, value]) => optionsMap[typeId] === value,
        ),
    )?.variant ?? null;

  const matchesOption = (
    optionTypeId: string,
    optionValue: string,
    purchasableOnly = false,
  ) => {
    const testOptions = { ...selectedOptions, [optionTypeId]: optionValue };
    return variantOptionMaps.some(
      ({ variant, optionsMap }) =>
        (!purchasableOnly || variant.purchasable) &&
        Object.entries(testOptions).every(
          ([typeId, value]) => optionsMap[typeId] === value,
        ),
    );
  };

  if (optionTypes.length === 0) return null;

  return (
    <div className="space-y-6">
      {optionTypes.map((optionType) => {
        const values = Array.from(optionValuesMap[optionType.id] || []);
        const selectedValue = selectedOptions[optionType.id];
        const isColor = optionType.kind === "color_swatch";

        return (
          <fieldset key={optionType.id}>
            <legend className="mb-3 flex w-full items-baseline justify-between gap-4">
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  theme === "dark" ? "text-zinc-200" : "text-zinc-950"
                }`}
              >
                {optionType.label}
              </span>
              {selectedValue && (
                <span
                  className={`truncate text-xs ${
                    theme === "dark" ? "text-zinc-500" : "text-zinc-500"
                  }`}
                >
                  {optionValueDetailsMap[`${optionType.id}:${selectedValue}`]
                    ?.label || selectedValue}
                </span>
              )}
            </legend>

            <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {values.map((value) => {
                const optionValue =
                  optionValueDetailsMap[`${optionType.id}:${value}`];
                const isSelected = selectedValue === value;
                const isAvailable = matchesOption(optionType.id, value);
                const isPurchasable = matchesOption(optionType.id, value, true);
                const label = optionValue?.label || value;

                return isColor ? (
                  <button
                    type="button"
                    key={value}
                    onClick={() =>
                      onVariantChange(
                        findVariant({
                          ...selectedOptions,
                          [optionType.id]: value,
                        }),
                      )
                    }
                    disabled={!isAvailable}
                    title={label}
                    aria-label={label}
                    aria-pressed={isSelected}
                    className={`relative size-10 border p-1.5 outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isSelected
                        ? theme === "dark"
                          ? "border-[#d4030a] focus-visible:ring-white"
                          : "border-zinc-950"
                        : theme === "dark"
                          ? "border-white/25 hover:border-white/70 focus-visible:ring-white"
                          : "border-zinc-300 hover:border-zinc-700"
                    } ${!isAvailable ? "cursor-not-allowed opacity-25" : ""}`}
                  >
                    <span
                      className="block size-full"
                      style={
                        optionValue?.image_url
                          ? {
                              backgroundImage: `url(${optionValue.image_url})`,
                              backgroundSize: "cover",
                            }
                          : {
                              backgroundColor:
                                optionValue?.color_code || "#9faaae",
                            }
                      }
                    />
                    {!isPurchasable && isAvailable && (
                      <span className="absolute left-1/2 top-1/2 h-px w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-zinc-500" />
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    key={value}
                    onClick={() =>
                      onVariantChange(
                        findVariant({
                          ...selectedOptions,
                          [optionType.id]: value,
                        }),
                      )
                    }
                    disabled={!isAvailable}
                    aria-pressed={isSelected}
                    className={`min-h-11 shrink-0 border px-4 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px ${
                      isSelected
                        ? theme === "dark"
                          ? "border-[#d4030a] bg-[#d4030a] text-[#1e1112] focus-visible:ring-white"
                          : "border-zinc-950 bg-zinc-950 text-white"
                        : theme === "dark"
                          ? "border-white/25 bg-transparent text-zinc-200 hover:border-white/80 focus-visible:ring-white"
                          : "border-zinc-300 bg-transparent text-zinc-800 hover:border-zinc-950"
                    } ${!isAvailable ? "cursor-not-allowed opacity-30" : ""}`}
                  >
                    {label}
                    {!isPurchasable && isAvailable && (
                      <span className="ml-1 text-[10px] opacity-60">
                        {t("outOfStockVariant")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
