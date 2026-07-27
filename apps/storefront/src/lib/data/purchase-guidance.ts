"use server";

export interface PurchaseGuidance {
  id: string;
  source_product_id: string;
  role: string;
  rationale: string;
  product: {
    id: string;
    name: string;
    slug: string;
    available: boolean;
    image_url: string | null;
  };
}

export async function getPurchaseGuidance(slugs: string[]) {
  const baseUrl = process.env.SPREE_API_URL;
  if (!baseUrl || slugs.length === 0) return [];

  const params = new URLSearchParams();
  for (const slug of [...new Set(slugs)].slice(0, 20)) {
    params.append("product_slugs[]", slug);
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/v3/store/purchase_guidance?${params.toString()}`,
      { cache: "no-store" },
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as { data: PurchaseGuidance[] };
    return payload.data.filter((entry) => entry.product.available);
  } catch {
    return [];
  }
}
