import type { Product } from "@spree/sdk";
import { ProductRunway } from "@/components/home/ProductRunway";
import { getProducts } from "@/lib/data/products";

interface TopPicksSectionProps {
  basePath: string;
}

export async function TopPicksSection({ basePath }: TopPicksSectionProps) {
  const [newArrivals, topPicks] = await Promise.all([
    getProducts({
      limit: 6,
      sort: "-available_on",
      expand: ["variants", "media"],
    })
      .then((response) => response.data)
      .catch(() => [] as Product[]),
    getProducts({
      limit: 6,
      sort: "best_selling",
      expand: ["variants", "media"],
    })
      .then((response) => response.data)
      .catch(() => [] as Product[]),
  ]);

  if (newArrivals.length === 0 && topPicks.length === 0) return null;

  return (
    <ProductRunway
      basePath={basePath}
      newArrivals={newArrivals}
      topPicks={topPicks.length > 0 ? topPicks : newArrivals}
    />
  );
}
