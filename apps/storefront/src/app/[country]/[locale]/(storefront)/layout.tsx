import type { Category } from "@spree/sdk";
import Link from "next/link";
import { LivePresenceHeartbeat } from "@/components/analytics/LivePresenceHeartbeat";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCategories } from "@/lib/data/categories";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ country: string; locale: string }>;
}

function CategoryLinks({
  categories,
  basePath,
}: {
  categories: Category[];
  basePath: string;
}) {
  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>
          <Link href={`${basePath}/c/${category.permalink}`}>
            {category.name}
          </Link>
          {category.children && category.children.length > 0 && (
            <CategoryLinks categories={category.children} basePath={basePath} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function StorefrontLayout({
  children,
  params,
}: StorefrontLayoutProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const publishableKey = process.env.SPREE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("SPREE_PUBLISHABLE_KEY is required for the storefront");
  }

  const rootCategories = await getCategories({
    depth_eq: 0,
    expand: ["children.children"],
  })
    .then((res) => res.data)
    .catch((error) => {
      console.error("StorefrontLayout: failed to load categories", error);
      return [] as Category[];
    });

  return (
    <div
      className="storefront-spatial-shell flex min-h-[100dvh] flex-col"
      data-storefront-shell
    >
      <LivePresenceHeartbeat
        country={country}
        locale={locale}
        publishableKey={publishableKey}
      />
      <Header
        rootCategories={rootCategories}
        basePath={basePath}
        locale={locale as Locale}
      />
      {rootCategories.length > 0 && (
        <nav aria-label="Category navigation" className="sr-only">
          <CategoryLinks categories={rootCategories} basePath={basePath} />
        </nav>
      )}
      <main className="flex-1">{children}</main>
      <Footer
        rootCategories={rootCategories}
        basePath={basePath}
        locale={locale as Locale}
      />
    </div>
  );
}
