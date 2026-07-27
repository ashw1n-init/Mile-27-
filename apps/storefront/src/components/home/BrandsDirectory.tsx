import type { Product } from "@spree/sdk";
import { BrandsDirectoryShowcase } from "@/components/home/BrandsDirectoryShowcase";
import { getCategory, getCategoryProducts } from "@/lib/data/categories";

interface BrandsDirectoryProps {
  basePath: string;
}

export interface DirectoryBrand {
  id: string;
  name: string;
  permalink: string;
  product: {
    name: string;
    slug: string;
    thumbnailUrl: string | null;
  } | null;
}

const FEATURED_BRAND_PERMALINKS = [
  "brands/alpinestars",
  "brands/held",
  "brands/dainese",
  "brands/shoei",
  "brands/agv",
  "brands/revit",
  "brands/arai",
  "brands/berik",
] as const;

async function getDirectoryBrands(): Promise<DirectoryBrand[]> {
  const selectedBrands = (
    await Promise.all(
      FEATURED_BRAND_PERMALINKS.map((permalink) =>
        getCategory(permalink).catch(() => null),
      ),
    )
  ).filter((brand) => brand !== null);

  const products = await Promise.all(
    selectedBrands.map((brand) =>
      getCategoryProducts(brand.id, {
        limit: 1,
        sort: "-available_on",
        fields: ["id", "name", "slug", "thumbnail_url"],
      })
        .then((response) => response.data[0] ?? null)
        .catch(() => null as Product | null),
    ),
  );

  return selectedBrands.map((brand, index) => {
    const product = products[index];

    return {
      id: brand.id,
      name: brand.name,
      permalink: brand.permalink,
      product: product
        ? {
            name: product.name,
            slug: product.slug,
            thumbnailUrl: product.thumbnail_url,
          }
        : null,
    };
  });
}

export async function BrandsDirectory({ basePath }: BrandsDirectoryProps) {
  const brands = await getDirectoryBrands();

  if (brands.length === 0) return null;

  return <BrandsDirectoryShowcase basePath={basePath} brands={brands} />;
}
