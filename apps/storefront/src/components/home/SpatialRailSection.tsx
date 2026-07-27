import type { Product } from "@spree/sdk";
import { SpatialRail } from "@/components/home/SpatialRail";
import { getProducts } from "@/lib/data/products";

interface SpatialRailSectionProps {
  basePath: string;
}

export async function SpatialRailSection({
  basePath,
}: SpatialRailSectionProps) {
  const products = await getProducts({ limit: 6, sort: "best_selling" })
    .then((response) => response.data)
    .catch(() => [] as Product[]);

  if (products.length === 0) return null;

  return <SpatialRail basePath={basePath} products={products} />;
}
