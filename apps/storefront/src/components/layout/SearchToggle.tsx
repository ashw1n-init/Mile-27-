"use client";

import { Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { PixelRunnerMark } from "@/components/layout/PixelRunnerMark";
import { Button } from "@/components/ui/button";

const SearchBar = dynamic(
  () =>
    import("@/components/search/SearchBar").then((mod) => ({
      default: mod.SearchBar,
    })),
  {
    loading: () => (
      <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
    ),
  },
);

interface SearchToggleProps {
  basePath: string;
  /** Left slot (e.g. mobile menu) */
  left: ReactNode;
  /** Center slot (e.g. logo) */
  center: ReactNode;
  /** Rendered before the search button in the right section */
  rightStart: ReactNode;
  /** Rendered after the search button in the right section */
  rightEnd: ReactNode;
  /** When true, the header sits over a dark hero and inverts its chrome. */
  overlay?: boolean;
}

export function SearchToggle({
  basePath,
  left,
  center,
  rightStart,
  rightEnd,
  overlay = false,
}: SearchToggleProps) {
  const t = useTranslations("header");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    searchTriggerRef.current?.focus();
  }, []);

  return (
    <header
      className={`storefront-header sticky top-0 z-50 px-3 pt-3 sm:px-5 ${
        overlay ? "bg-transparent text-white" : "text-zinc-950"
      }`}
    >
      <div className="relative">
        <div
          className={`transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            searchOpen
              ? "pointer-events-none translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <div className="storefront-nav-island mx-auto grid h-[4.5rem] max-w-[1880px] grid-cols-[minmax(0,1fr)_auto] items-stretch px-3 sm:px-5 xl:h-[4.75rem] xl:grid-cols-[minmax(17rem,0.85fr)_minmax(30rem,1.5fr)_minmax(22rem,0.95fr)] xl:px-5">
            <div className="flex min-w-0 items-center">{left}</div>
            <div className="hidden min-w-0 justify-center xl:flex">
              {center}
            </div>
            <div className="flex min-w-0 items-center justify-end gap-1">
              {rightStart}

              <Button
                ref={searchTriggerRef}
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                aria-label={t("openSearch")}
                aria-expanded={searchOpen}
                aria-controls="search-overlay"
                className={`my-auto hidden h-11 min-w-40 rounded-full border-0 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] xl:flex xl:min-w-56 ${
                  overlay
                    ? "bg-white/10 text-white hover:bg-white/15"
                    : "bg-black/[0.045] hover:bg-black/[0.075]"
                }`}
              >
                <Search className="size-4" aria-hidden="true" />
                <span className="ml-3 mr-auto text-left text-xs font-medium">
                  Search equipment
                </span>
                <span
                  className="size-1.5 rounded-full bg-[#d4030a]"
                  aria-hidden="true"
                />
              </Button>

              {rightEnd}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t("openSearch")}
            aria-expanded={searchOpen}
            aria-controls="search-overlay"
            className="mx-auto mt-2 flex h-12 w-[calc(100%_-_1rem)] items-center gap-3 rounded-full bg-white/90 px-4 text-left shadow-[0_12px_34px_rgba(51,55,58,0.09)] backdrop-blur-xl sm:px-6 xl:hidden"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="text-xs text-[#5c656a]">
              Search brand, model, helmet or accessory
            </span>
            <span className="ml-auto font-sans text-[8px] uppercase tracking-[0.14em] text-[#9faaae]">
              Find
            </span>
          </button>
        </div>

        {searchOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#1e1112]/10"
            onClick={closeSearch}
            role="presentation"
          />
        )}

        <div
          id="search-overlay"
          inert={!searchOpen}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeSearch();
          }}
          className={`absolute inset-x-3 top-3 z-50 overflow-hidden rounded-[1.5rem] bg-white/95 shadow-[0_24px_70px_rgba(51,55,58,0.16)] backdrop-blur-2xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:inset-x-5 ${
            searchOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-3 opacity-0"
          }`}
        >
          <div className="mx-auto flex h-[7.5rem] max-w-[1920px] items-center gap-3 px-4 sm:px-8 xl:h-20 xl:px-10">
            <PixelRunnerMark className="hidden size-12 shrink-0 xl:block" />
            <div className="flex-1 xl:ml-10">
              <SearchBar
                key={String(searchOpen)}
                basePath={basePath}
                autoFocus={searchOpen}
                onNavigate={closeSearch}
              />
            </div>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={closeSearch}
              aria-label={t("closeSearch")}
              className="rounded-none"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
