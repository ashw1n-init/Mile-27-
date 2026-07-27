import type * as React from "react";

/**
 * Loading state with the same proportions and rules as the indexed product sheet.
 */
export function ProductCardSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse border-r border-b border-[#9faaae] bg-white">
      <div className="flex h-10 items-center justify-between border-b border-[#9faaae] px-3 sm:px-4">
        <div className="h-2 w-5 bg-black/10" />
        <div className="h-2 w-16 bg-black/10" />
      </div>
      <div className="aspect-[4/5] bg-[#ffffff]" />
      <div className="border-t border-[#9faaae] px-3 py-3 sm:px-4 sm:py-4">
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
