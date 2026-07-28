import { ProductCardSkeleton } from "./ProductCardSkeleton";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 px-3 py-5 sm:gap-6 sm:px-5 sm:py-7 md:grid-cols-3 lg:grid-cols-4 lg:gap-7 lg:px-8 2xl:grid-cols-5">
      {[...Array(10)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
