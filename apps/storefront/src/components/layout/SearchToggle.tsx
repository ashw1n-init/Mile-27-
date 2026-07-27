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
      className={`sticky top-0 z-50 ${
        overlay
          ? "bg-transparent border-b border-white/10 text-white"
          : "border-b border-[#9faaae] bg-white text-zinc-950"
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
          <div className="mx-auto grid h-[4.5rem] max-w-[1920px] grid-cols-[minmax(0,1fr)_auto] items-stretch px-4 sm:px-8 xl:h-20 xl:grid-cols-[minmax(16rem,0.8fr)_minmax(28rem,1.6fr)_minmax(19rem,0.9fr)] xl:px-10">
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
                className={`hidden h-full min-w-40 rounded-none border-x px-4 xl:flex xl:min-w-52 ${
                  overlay
                    ? "border-white/10 text-white hover:bg-white/10"
                    : "border-[#9faaae] hover:bg-[#ffffff]"
                }`}
              >
                <Search className="size-4" aria-hidden="true" />
                <span className="ml-3 mr-auto text-left text-xs font-medium">
                  Search equipment
                </span>
                <kbd className="font-sans text-[8px] font-normal text-[#5c656a]">
                  /
                </kbd>
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
            className="flex h-12 w-full items-center gap-3 border-t border-[#9faaae] px-4 text-left sm:px-8 xl:hidden"
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
          className={`absolute inset-x-0 top-0 z-50 bg-white transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
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
