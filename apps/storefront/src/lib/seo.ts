import type { Category, Media, Product } from "@spree/sdk";
import type { RiderVoicesResponse } from "@/lib/data/rider-voices";
import { ensureProtocol, getStoreName, getStoreUrl } from "@/lib/store";

/**
 * Default social image path (stored in public/).
 * Replace public/social-image.png with your own 1200x630 OG image.
 */
export const SOCIAL_IMAGE_PATH = "/social-image.webp";

/**
 * Build a full canonical URL from a store URL and a relative path.
 */
export function buildCanonicalUrl(storeUrl: string, path: string): string {
  const base = ensureProtocol(storeUrl).replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Strip HTML tags from a string.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Build JSON-LD Product schema.
 * https://schema.org/Product
 */
export function buildProductJsonLd(
  product: Product,
  canonicalUrl: string,
  riderVoices?: RiderVoicesResponse,
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: canonicalUrl,
  };

  if (product.description) {
    schema.description = stripHtml(product.description);
  }

  if (product.default_variant?.sku) {
    schema.sku = product.default_variant.sku;
  }

  const brand = product.categories?.find((category) =>
    /(^|\/)brands?(\/|$)/i.test(category.permalink),
  );
  if (brand) {
    schema.brand = {
      "@type": "Brand",
      name: brand.name,
    };
  }

  const imageUrls = (product.media || [])
    .map((img: Media) => img.original_url || img.large_url)
    .filter(Boolean);
  // Fall back to thumbnail_url if no media from expand
  if (imageUrls.length === 0 && product.thumbnail_url) {
    imageUrls.push(product.thumbnail_url);
  }
  if (imageUrls.length > 0) {
    schema.image = imageUrls;
  }

  if (product.price?.amount && product.price?.currency) {
    schema.offers = {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: product.price.currency,
      price: product.price.amount,
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    };
  }

  const reviewSummary = riderVoices?.meta.summary;
  if (
    reviewSummary?.average_rating &&
    reviewSummary.review_count > 0 &&
    riderVoices
  ) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewSummary.average_rating,
      reviewCount: reviewSummary.review_count,
      bestRating: 5,
      worstRating: 1,
    };
    schema.review = riderVoices.data
      .filter(
        (voice) =>
          (voice.type === "review" || voice.type === "rider_story") &&
          voice.rating,
      )
      .map((voice) => ({
        "@type": "Review",
        "@id": `${canonicalUrl}#rider-voice-${voice.id}`,
        author: { "@type": "Person", name: voice.display_name },
        datePublished: voice.published_at,
        name: voice.title || undefined,
        reviewBody: voice.body,
        reviewRating: {
          "@type": "Rating",
          ratingValue: voice.rating,
          bestRating: 5,
          worstRating: 1,
        },
      }));
  }

  return schema;
}

/**
 * Build JSON-LD BreadcrumbList schema from a category with ancestors.
 * https://schema.org/BreadcrumbList
 */
export function buildBreadcrumbJsonLd(
  category: Category,
  basePath: string,
  storeUrl: string,
  product?: { name: string; slug: string },
): Record<string, unknown> {
  const items: Array<{ name: string; url: string }> = [
    { name: "Home", url: buildCanonicalUrl(storeUrl, basePath) },
  ];

  if (category.ancestors) {
    for (const ancestor of category.ancestors) {
      if (!ancestor.is_root) {
        items.push({
          name: ancestor.name,
          url: buildCanonicalUrl(
            storeUrl,
            `${basePath}/c/${ancestor.permalink}`,
          ),
        });
      }
    }
  }

  items.push({
    name: category.name,
    url: buildCanonicalUrl(storeUrl, `${basePath}/c/${category.permalink}`),
  });

  if (product) {
    items.push({
      name: product.name,
      url: buildCanonicalUrl(storeUrl, `${basePath}/products/${product.slug}`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Build JSON-LD Organization schema from environment variables.
 * https://schema.org/Organization
 */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  const storeName = getStoreName();
  const storeUrl = getStoreUrl();
  const configuredLogoUrl = process.env.STORE_LOGO_URL;
  const logoUrl =
    configuredLogoUrl ||
    (storeUrl
      ? new URL(BRAND_LOGO_PATH, storeUrl).toString()
      : BRAND_LOGO_PATH);
  const facebook = process.env.STORE_FACEBOOK;
  const twitter = process.env.STORE_TWITTER;
  const instagram = process.env.STORE_INSTAGRAM;
  const supportEmail = process.env.STORE_SUPPORT_EMAIL;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": storeUrl ? `${storeUrl.replace(/\/$/, "")}#organization` : undefined,
    name: storeName,
    alternateName: ["Mile27", "Mile27 Store", "Mile 27"],
    foundingDate: "2019",
    areaServed: { "@type": "Country", name: "India" },
    ...(storeUrl ? { url: storeUrl } : {}),
  };

  schema.logo = {
    "@type": "ImageObject",
    url: logoUrl,
    contentUrl: logoUrl,
    width: 934,
    height: 1024,
  };

  const sameAs: string[] = [];
  if (facebook) sameAs.push(facebook);
  if (twitter) {
    sameAs.push(
      twitter.startsWith("http")
        ? twitter
        : `https://twitter.com/${twitter.replace("@", "")}`,
    );
  }
  if (instagram) {
    sameAs.push(
      instagram.startsWith("http")
        ? instagram
        : `https://instagram.com/${instagram.replace("@", "")}`,
    );
  }
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  if (supportEmail) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      email: supportEmail,
      contactType: "customer service",
    };
  }

  return schema;
}

function storeUrlForPath(path: string): string | undefined {
  const storeUrl = getStoreUrl();
  return storeUrl ? buildCanonicalUrl(storeUrl, path) : undefined;
}

export function buildWebsiteJsonLd(basePath: string): Record<string, unknown> {
  const storeUrl = getStoreUrl();
  const rootUrl = storeUrl ? buildCanonicalUrl(storeUrl, basePath) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    ...(storeUrl ? { "@id": `${storeUrl.replace(/\/$/, "")}#website` } : {}),
    name: getStoreName(),
    alternateName: ["Mile27", "Mile27 Store", "Mile 27"],
    ...(rootUrl ? { url: rootUrl } : {}),
    ...(storeUrl
      ? {
          publisher: { "@id": `${storeUrl.replace(/\/$/, "")}#organization` },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${buildCanonicalUrl(storeUrl, `${basePath}/products`)}?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };
}

export function buildCollectionPageJsonLd(
  category: Category,
  basePath: string,
): Record<string, unknown> {
  const url = storeUrlForPath(`${basePath}/c/${category.permalink}`);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    ...(category.description
      ? { description: stripHtml(category.description) }
      : {}),
    ...(url ? { "@id": url, url } : {}),
    isPartOf: getStoreUrl()
      ? { "@id": `${getStoreUrl()?.replace(/\/$/, "")}#website` }
      : undefined,
    about: {
      "@type": /(^|\/)brands?(\/|$)/i.test(category.permalink)
        ? "Brand"
        : "Thing",
      name: category.name,
    },
  };
}

import { BRAND_LOGO_PATH } from "@/lib/brand";
