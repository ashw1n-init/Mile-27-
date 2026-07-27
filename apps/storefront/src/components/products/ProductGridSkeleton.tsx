import { ProductCardSkeleton } from "./ProductCardSkeleton";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 border-l border-t border-[#9faaae] md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {[...Array(10)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
