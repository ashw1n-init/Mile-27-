import type { Product } from "@spree/sdk";

function assetKey(url: string | null | undefined): string | null {
  if (!url) return null;

  let decoded = url;
  for (let pass = 0; pass < 2; pass += 1) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  }

  return decoded.split("?")[0].split("/").pop()?.toLowerCase() ?? decoded;
}

export function getProductCardAlternateImage(product: Product): string | null {
  const primaryAsset = assetKey(product.thumbnail_url);
  const variantImage = product.variants
    ?.filter((variant) => variant.id !== product.default_variant_id)
    .map((variant) => variant.thumbnail_url)
    .find((url) => url && assetKey(url) !== primaryAsset);

  if (variantImage) return variantImage;

  const mediaCandidates = product.media
    ?.filter((media) => media.media_type.toLowerCase().includes("image"))
    .sort((left, right) => {
      const leftIsAlternateVariant =
        left.variant_ids.length > 0 &&
        !left.variant_ids.includes(product.default_variant_id);
      const rightIsAlternateVariant =
        right.variant_ids.length > 0 &&
        !right.variant_ids.includes(product.default_variant_id);
      return Number(rightIsAlternateVariant) - Number(leftIsAlternateVariant);
    })
    .map(
      (media) =>
        media.large_url ?? media.medium_url ?? media.original_url ?? null,
    );

  return (
    mediaCandidates?.find((url) => url && assetKey(url) !== primaryAsset) ??
    null
  );
}
