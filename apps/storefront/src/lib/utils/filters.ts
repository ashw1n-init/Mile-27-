import type { ActiveFilters } from "@/types/filters";

export function filtersEqual(a: ActiveFilters, b: ActiveFilters): boolean {
  if (a.priceMin !== b.priceMin || a.priceMax !== b.priceMax) return false;
  if (a.availability !== b.availability) return false;
  if (a.sortBy !== b.sortBy) return false;
  if (a.optionValues.length !== b.optionValues.length) return false;
  const aVals = [...a.optionValues].sort();
  const bVals = [...b.optionValues].sort();
  for (let i = 0; i < aVals.length; i++) {
    if (aVals[i] !== bVals[i]) return false;
  }
  return true;
}

export function getActiveFilterCount(filters: ActiveFilters): number {
  return (
    filters.optionValues.length +
    (filters.priceMin !== undefined || filters.priceMax !== undefined ? 1 : 0) +
    (filters.availability ? 1 : 0)
  );
}

/**
 * Converts compound catalogue option values into a concise customer-facing
 * label without changing the option ID used for filtering. Some imported
 * catalogues encode size and colour in one value (for example
 * `S:Colour:White`) because they are not modelled as independent option types.
 */
export function getOptionValueLabel(label: string): string {
  const parts = parseCompoundOptionValue(label);
  if (parts) return `${parts.size} · ${parts.color}`;
  return label.trim();
}

export interface CompoundOptionValue {
  size: string;
  color: string;
}

export function parseCompoundOptionValue(
  label: string,
): CompoundOptionValue | null {
  const normalized = label.trim();
  const compactMatch = normalized.match(
    /^([^:,|]+)\s*:\s*colou?r\s*:\s*(.+)$/i,
  );
  if (compactMatch) {
    return {
      size: compactMatch[1].trim(),
      color: compactMatch[2].trim(),
    };
  }

  const namedMatch = normalized.match(
    /^size\s*:\s*([^,|]+)\s*[,|]\s*colou?r\s*:\s*(.+)$/i,
  );
  if (namedMatch) {
    return {
      size: namedMatch[1].trim(),
      color: namedMatch[2].trim(),
    };
  }

  return null;
}

/** Maps sort API keys to translation message keys in the "products" namespace. */
const SORT_KEY_TO_MESSAGE: Record<string, string> = {
  manual: "manual",
  best_selling: "bestSelling",
  price: "priceLowHigh",
  "-price": "priceHighLow",
  "-available_on": "newest",
  available_on: "oldest",
  name: "nameAZ",
  "-name": "nameZA",
};

export function normalizeSortKey(key: string): string {
  if (key in SORT_KEY_TO_MESSAGE) return key;
  const match = key.match(/^(\w+)\s+(asc|desc)$/);
  if (!match) return key;
  const [, field, direction] = match;
  const needsNegation =
    (field === "available_on" && direction === "desc") ||
    (field !== "available_on" && direction === "desc");
  return needsNegation ? `-${field}` : field;
}

/**
 * Get a translated sort label.
 * Pass a `t` function from `useTranslations("products")`.
 * Falls back to the raw key if no translator is provided.
 */
const SORT_FALLBACK: Record<string, string> = {
  manual: "Manual",
  best_selling: "Best Selling",
  price: "Price (low-high)",
  "-price": "Price (high-low)",
  "-available_on": "Newest",
  available_on: "Oldest",
  name: "Name (A-Z)",
  "-name": "Name (Z-A)",
};

export function getSortLabel(key: string, t?: (key: string) => string): string {
  const normalized = normalizeSortKey(key);
  const messageKey = SORT_KEY_TO_MESSAGE[normalized];
  if (messageKey && t) return t(messageKey);
  return SORT_FALLBACK[normalized] || key;
}

/** Maps availability API values to translation message keys in the "products" namespace. */
const AVAILABILITY_KEY_TO_MESSAGE: Record<string, string> = {
  in_stock: "inStock",
  out_of_stock: "outOfStock",
};

/**
 * Get a translated availability label.
 * Pass a `t` function from `useTranslations("products")`.
 */
const AVAILABILITY_FALLBACK: Record<string, string> = {
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
};

export function getAvailabilityLabel(
  id: string,
  t?: (key: string) => string,
): string {
  const messageKey = AVAILABILITY_KEY_TO_MESSAGE[id];
  if (messageKey && t) return t(messageKey);
  return AVAILABILITY_FALLBACK[id] || id;
}
