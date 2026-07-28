import type { Product } from "@spree/sdk";
import { SpatialRail } from "@/components/home/SpatialRail";
import { getCategory, getCategoryProducts } from "@/lib/data/categories";

interface SpatialRailSectionProps {
  basePath: string;
}

export async function SpatialRailSection({
  basePath,
}: SpatialRailSectionProps) {
  const products = await getCategory("brands/agv")
    .then((brand) =>
      getCategoryProducts(brand.id, {
        limit: 6,
        sort: "-available_on",
      }),
    )
    .then((response) => response.data)
    .catch(() => [] as Product[]);

  if (products.length === 0) return null;

  return <SpatialRail basePath={basePath} products={products} />;
}
