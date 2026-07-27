import type { Category } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { DiscoveryMasthead } from "@/components/products/DiscoveryMasthead";

interface CategoryBannerProps {
  category: Category;
  basePath: string;
  locale: string;
}

export async function CategoryBanner({
  category,
  basePath,
  locale,
}: CategoryBannerProps) {
  "use cache: remote";
  cacheLife("minutes");
  cacheTag("category-banner");

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "navigation",
  });
  const isBrandIndex = category.permalink === "brands";
  const breadcrumbs = [
    { label: t("home"), href: basePath },
    ...(category.ancestors ?? []).map((ancestor) => ({
      label: ancestor.name,
      href: `${basePath}/c/${ancestor.permalink}`,
    })),
    { label: category.name },
  ];
  const indexItems = (category.children ?? []).map((child) => ({
    id: child.id,
    name: child.name,
    href: `${basePath}/c/${child.permalink}`,
  }));

  return (
    <DiscoveryMasthead
      eyebrow={isBrandIndex ? "Maker directory" : "Collection index"}
      title={category.name}
      description={category.description}
      imageUrl={category.image_url}
      breadcrumbs={breadcrumbs}
      indexItems={indexItems}
      indexLabel={isBrandIndex ? "Maker index" : "Explore collection"}
    />
  );
}
