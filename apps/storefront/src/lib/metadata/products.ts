import type { Metadata } from "next";
import { buildCanonicalUrl } from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";

interface ProductsMetadataParams {
  country: string;
  locale: string;
}

export async function generateProductsMetadata({
  country,
  locale,
}: ProductsMetadataParams): Promise<Metadata> {
  const storeUrl = getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(storeUrl, `/${country}/${locale}/products`)
    : undefined;

  return {
    title: "Motorcycle Helmets, Riding Gear & Accessories",
    description:
      "Shop premium motorcycle helmets, riding gear, intercoms and accessories from leading brands at Mile 27 Store, India.",
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title: "Motorcycle Helmets, Riding Gear & Accessories",
      description:
        "Shop premium motorcycle helmets, riding gear, intercoms and accessories from leading brands at Mile 27 Store, India.",
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Motorcycle Helmets, Riding Gear & Accessories",
      description:
        "Shop premium motorcycle helmets, riding gear, intercoms and accessories from leading brands at Mile 27 Store, India.",
    },
  };
}
