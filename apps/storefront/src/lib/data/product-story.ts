export interface ProductStoryMedia {
  url: string;
  alt_text?: string;
  caption?: string;
  poster_url?: string;
  transcript_url?: string;
  type?: "image" | "video";
}

export interface ProductStoryCallout {
  title: string;
  body?: string;
  value?: string;
}

export interface ProductStoryModule {
  id: string;
  module_type: string;
  position: number;
  heading?: string;
  subheading?: string;
  body?: string;
  layout?: string;
  background_style: string;
  visibility: "visible" | "desktop_only" | "mobile_only";
  media: ProductStoryMedia[];
  callouts: ProductStoryCallout[];
  product_relations: Array<Record<string, unknown>>;
  source_references: Array<Record<string, unknown>>;
  mobile_configuration: Record<string, unknown>;
  configuration: Record<string, unknown>;
}

export interface ProductStory {
  id: string;
  title: string;
  eyebrow?: string;
  introduction?: string;
  theme: string;
  locale: string;
  reviewed_by?: string;
  reviewed_at?: string;
  published_at: string;
  modules: ProductStoryModule[];
}

export async function getProductStory(productId: string, locale: string) {
  const baseUrl = process.env.SPREE_API_URL;
  if (!baseUrl) return null;

  try {
    const response = await fetch(
      `${baseUrl}/api/v3/store/products/${encodeURIComponent(productId)}/product_story?locale=${encodeURIComponent(locale)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { data: ProductStory };
    return payload.data;
  } catch {
    return null;
  }
}
