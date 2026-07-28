import type * as React from "react";

/**
 * Loading state with the same proportions and rules as the indexed product sheet.
 */
export function ProductCardSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse overflow-hidden rounded-[1.25rem] bg-white/80 shadow-[0_14px_45px_rgba(56,61,64,0.07)]">
      <div className="flex h-10 items-center justify-between px-3 sm:px-4">
        <div className="h-2 w-5 bg-black/10" />
        <div className="h-2 w-16 bg-black/10" />
      </div>
      <div className="mx-2 aspect-[4/5] rounded-[1rem] bg-[#eceeec]" />
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-3 h-2 w-14 bg-black/10" />
        <div className="h-3 w-11/12 bg-black/10" />
        <div className="mt-2 h-3 w-7/12 bg-black/10" />
        <div className="mt-4 h-3 w-1/4 bg-black/10" />
        <div className="mt-4 border-t border-black/10 pt-2">
          <div className="h-2 w-20 bg-black/10" />
        </div>
      </div>
    </div>
  );
}
