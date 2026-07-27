"use client";

import type { Media, Product, Variant } from "@spree/sdk";
import type { MotionValue } from "framer-motion";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  CircleX,
  LoaderCircle,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { MediaGallery } from "@/components/products/MediaGallery";
import { ProductCustomFields } from "@/components/products/ProductCustomFields";
import { ProductStorySection } from "@/components/products/ProductStorySection";
import { VariantPicker } from "@/components/products/VariantPicker";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityPicker } from "@/components/ui/quantity-picker";
import { TactileDisc } from "@/components/ui/tactile-disc";
import { useCart } from "@/contexts/CartContext";
import { useHiddenPricing } from "@/contexts/HiddenPricingContext";
import { useStore } from "@/contexts/StoreContext";
import { trackAddToCart, trackViewItem } from "@/lib/analytics/gtm";
import type { ProductStory } from "@/lib/data/product-story";
import { playTactilePress } from "@/lib/utils/tactile-feedback";

interface ProductDetailsProps {
  product: Product;
  basePath: string;
  productStory?: ProductStory | null;
}

interface ProductFact {
  label: string;
  value: string;
}

interface StoryChapter {
  title: string;
  body: string;
}

function plainText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateCopy(value: string, maxLength = 320): string {
  if (value.length <= maxLength) return value;
  const excerpt = value.slice(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(" ");
  return `${excerpt.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

function getMediaUrl(media: Media | undefined): string | null {
  return (
    media?.xlarge_url ||
    media?.large_url ||
    media?.original_url ||
    media?.medium_url ||
    null
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RevealWord({
  children,
  progress,
  start,
  reducedMotion,
}: {
  children: string;
  progress: MotionValue<number>;
  start: number;
  reducedMotion: boolean | null;
}) {
  const end = Math.min(start + 0.16, 1);
  const color = useTransform(
    progress,
    [start, end],
    reducedMotion ? ["#1e1112", "#1e1112"] : ["#9faaae", "#1e1112"],
  );
  const y = useTransform(
    progress,
    [start, end],
    reducedMotion ? ["0em", "0em"] : ["0.22em", "0em"],
  );

  return (
    <motion.span
      style={{ color, y }}
      className="inline-block will-change-transform"
    >
      {children}
    </motion.span>
  );
}

function ScrollRevealText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();
  const words = children.split(/\s+/).filter(Boolean);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 82%", "end 42%"],
  });

  return (
    <p ref={containerRef} className={className}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            <RevealWord
              progress={scrollYProgress}
              start={index / Math.max(words.length, 1)}
              reducedMotion={reducedMotion}
            >
              {word}
            </RevealWord>{" "}
          </span>
        ))}
      </span>
    </p>
  );
}

function CinematicMedia({
  media,
  productName,
  index,
}: {
  media: Media;
  productName: string;
  index: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["-4%", "4%"],
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#ffffff] ${
        index === 0
          ? "aspect-[4/5] md:col-span-7 md:aspect-[4/3]"
          : index === 1
            ? "aspect-[4/5] md:col-span-4 md:col-start-9 md:mt-48"
            : "aspect-[16/11] md:col-span-8 md:col-start-3 md:mt-10"
      }`}
    >
      <motion.div
        style={{ y: imageY }}
        className="absolute -inset-y-[5%] inset-x-0"
      >
        <ProductImage
          src={getMediaUrl(media)}
          alt={media.alt || productName}
          fill
          className="object-contain p-[6%]"
          sizes={
            index === 1
              ? "(max-width: 767px) 100vw, 34vw"
              : "(max-width: 767px) 100vw, 70vw"
          }
        />
      </motion.div>
      <span className="absolute bottom-5 left-5 font-sans text-[10px] tracking-[0.16em] text-[#5c656a]">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

export function ProductDetails({ product, productStory }: ProductDetailsProps) {
  const { addItem } = useCart();
  const { currency } = useStore();
  const t = useTranslations("products");
  const tw = useTranslations("wholesale");
  const hiddenPricing = useHiddenPricing();
  const pricesHidden = hiddenPricing !== null;

  const variants = useMemo(
    () => (product.variants || []).filter(Boolean),
    [product.variants],
  );
  const hasVariants = variants.length > 0;
  const optionTypes = product.option_types || [];
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (product.default_variant) return product.default_variant;
    if (hasVariants) {
      return variants.find((variant) => variant.purchasable) || variants[0];
    }
    return null;
  });
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackViewItem(product, currency);
  }, [product, currency]);

  const galleryImages = useMemo(
    (): Media[] => product.media || [],
    [product.media],
  );
  const variantImageIndex = useMemo((): number | null => {
    if (!selectedVariant) return null;
    const index = galleryImages.findIndex((media) =>
      media.variant_ids.includes(selectedVariant.id),
    );
    return index >= 0 ? index : null;
  }, [selectedVariant, galleryImages]);

  const price = selectedVariant?.price ?? product.price;
  const originalPrice =
    selectedVariant?.original_price ?? product.original_price;
  const displayPrice = price?.display_amount;
  const currentAmountCents = price?.amount_in_cents;
  const originalAmountCents = originalPrice?.amount_in_cents;
  const compareAtAmountCents = price?.compare_at_amount_in_cents;
  const onSale =
    (currentAmountCents != null &&
      originalAmountCents != null &&
      currentAmountCents < originalAmountCents) ||
    (compareAtAmountCents != null &&
      currentAmountCents != null &&
      currentAmountCents < compareAtAmountCents);
  const strikethroughPrice = onSale
    ? ((originalPrice?.display_amount &&
      originalPrice.display_amount !== displayPrice
        ? originalPrice.display_amount
        : price?.display_compare_at_amount) ?? null)
    : null;

  const isPurchasable = hasVariants
    ? (selectedVariant?.purchasable ?? false)
    : (product.purchasable ?? false);
  const inStock = hasVariants
    ? (selectedVariant?.in_stock ?? false)
    : (product.in_stock ?? false);
  const sku = selectedVariant?.sku || product.default_variant?.sku;
  const category = product.categories?.find((item) => !item.is_root);
  const storyFields = new Map(
    (product.custom_fields || [])
      .filter((field) => field.key.startsWith("product_story."))
      .map((field) => [field.key, plainText(field.value)]),
  );
  const storyKicker =
    storyFields.get("product_story.kicker") || "Product story";
  const storyHeadline =
    storyFields.get("product_story.headline") || product.name;
  const hasVeryLongTitle = product.name.length > 72;
  const hasLongTitle = product.name.length > 42;
  const heroTitleClassName = hasVeryLongTitle
    ? "max-w-[18ch] text-[clamp(2.35rem,4.35vw,5.25rem)] leading-[0.86] tracking-[-0.055em]"
    : hasLongTitle
      ? "max-w-[15ch] text-[clamp(2.8rem,5.7vw,6.75rem)] leading-[0.82] tracking-[-0.065em]"
      : "max-w-[9ch] text-[clamp(3.8rem,8.8vw,10rem)] leading-[0.78] tracking-[-0.075em]";
  const storySummary = truncateCopy(
    storyFields.get("product_story.intro") ||
      product.meta_description ||
      plainText(product.description).split(/\n+/)[0] ||
      "",
  );
  const storyChapters: StoryChapter[] = [1, 2, 3]
    .map((chapterNumber) => {
      const chapterKey = ["one", "two", "three"][chapterNumber - 1];
      return {
        title:
          storyFields.get(`product_story.chapter_${chapterKey}_title`) || "",
        body: storyFields.get(`product_story.chapter_${chapterKey}_body`) || "",
      };
    })
    .filter((chapter) => chapter.title && chapter.body);
  const storyMedia = galleryImages.slice(1, 4);
  const technicalFacts: ProductFact[] = [
    sku ? { label: t("sku"), value: sku } : null,
    selectedVariant?.weight
      ? { label: "Weight", value: `${selectedVariant.weight}` }
      : null,
    selectedVariant?.width && selectedVariant?.height
      ? {
          label: "Dimensions",
          value: `${selectedVariant.width} × ${selectedVariant.height}${
            selectedVariant.depth ? ` × ${selectedVariant.depth}` : ""
          }`,
        }
      : null,
    selectedVariant?.options_text
      ? { label: t("options"), value: selectedVariant.options_text }
      : null,
  ].filter((fact): fact is ProductFact => fact !== null);

  const handleAddToCart = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    playTactilePress(event.currentTarget);
    const variantId =
      selectedVariant?.id ||
      product.default_variant?.id ||
      product.default_variant_id;
    if (!variantId) throw new Error("No variant selected");

    setLoading(true);
    try {
      await addItem(variantId, quantity);
      trackAddToCart(product, selectedVariant, quantity, currency);
    } finally {
      setLoading(false);
    }
  };

  const purchaseButton = (
    <Button
      size="lg"
      onClick={handleAddToCart}
      disabled={loading || !isPurchasable}
      className="group relative h-16 min-w-0 flex-1 overflow-hidden rounded-none bg-[#d4030a] px-6 text-sm font-semibold text-[#1e1112] hover:bg-[#d4030a] disabled:bg-[#9faaae] disabled:text-[#5c656a]"
    >
      <TactileDisc />
      {loading ? (
        <>
          <span className="animate-spin">
            <LoaderCircle className="size-4" aria-hidden="true" />
          </span>
          {t("adding")}
        </>
      ) : isPurchasable ? (
        <>
          <ShoppingBag className="size-4" aria-hidden="true" />
          {t("addToCart")}
          <ArrowRight
            className="ml-auto size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </>
      ) : (
        t("outOfStock")
      )}
    </Button>
  );

  const purchaseControls = pricesHidden ? (
    <Button
      asChild
      size="lg"
      className="h-16 w-full rounded-none bg-[#d4030a] text-[#1e1112] hover:bg-[#d4030a]"
    >
      <Link href={hiddenPricing.signInHref}>
        {tw("hiddenPrice.signInToOrder")}
      </Link>
    </Button>
  ) : (
    <div className="flex gap-2">
      <QuantityPicker
        quantity={quantity}
        onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
        onIncrement={() => setQuantity(quantity + 1)}
        size="lg"
      />
      {purchaseButton}
    </div>
  );

  return (
    <article className="product-cinema overflow-clip bg-white text-[#1e1112]">
      <section className="relative min-h-[calc(100dvh-4.5rem)] border-b border-[#9faaae]">
        <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-[1920px] grid-cols-1 lg:grid-cols-12">
          <div className="grid min-h-[58dvh] grid-rows-[auto_minmax(12rem,1fr)_auto] overflow-hidden border-b border-[#9faaae] px-4 pt-8 sm:px-8 lg:col-span-8 lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:border-b-0 lg:border-r lg:px-10">
            <div className="relative z-10 flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.16em] text-[#5c656a]">
              <span className="shrink-0">{category?.name || "Product"}</span>
              <span className="ml-6 truncate text-right">
                {sku || product.slug}
              </span>
            </div>

            <motion.div
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-0 overflow-hidden"
            >
              <MediaGallery
                images={galleryImages}
                productName={product.name}
                activeIndex={variantImageIndex}
                theme="light"
              />
            </motion.div>

            <div className="pointer-events-none relative z-10 pb-7 pt-5 lg:pb-10">
              <h1
                className={`${heroTitleClassName} text-balance break-words font-semibold`}
              >
                {product.name}
              </h1>
            </div>
          </div>

          <aside className="flex flex-col justify-between px-4 py-7 sm:px-8 lg:col-span-4 lg:px-10 lg:py-10">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#5c656a]">
                Select and configure
              </p>

              <div className="mt-8 flex items-end justify-between gap-5 border-b border-[#9faaae] pb-8">
                {displayPrice ? (
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-[clamp(2.6rem,4vw,4.8rem)] font-medium leading-none tracking-[-0.055em]">
                      {displayPrice}
                    </span>
                    {strikethroughPrice && (
                      <span className="text-sm text-[#5c656a] line-through">
                        {strikethroughPrice}
                      </span>
                    )}
                  </div>
                ) : (
                  <HiddenPricePrompt className="text-base font-medium text-[#1e1112] underline underline-offset-4 hover:text-[#d4030a]" />
                )}
                {onSale && (
                  <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-[#d4030a]">
                    {t("sale")}
                  </span>
                )}
              </div>

              <p className="mt-5 flex items-center gap-2 text-sm text-[#5c656a]">
                {inStock ? (
                  <>
                    <Check
                      className="size-4 text-[#d4030a]"
                      aria-hidden="true"
                    />
                    {t("inStock")}
                  </>
                ) : (
                  <>
                    <CircleX className="size-4" aria-hidden="true" />
                    {t("outOfStock")}
                  </>
                )}
              </p>

              {hasVariants && optionTypes.length > 0 && (
                <div className="mt-8 border-t border-[#9faaae] pt-7">
                  <VariantPicker
                    variants={variants}
                    optionTypes={optionTypes}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                    theme="light"
                  />
                </div>
              )}
            </div>

            <div className="mt-10 border-t border-[#9faaae] pt-5 lg:mt-8">
              {purchaseControls}
            </div>
          </aside>
        </div>
      </section>

      {productStory && (
        <ProductStorySection
          story={productStory}
          fallbackMedia={galleryImages
            .map(getMediaUrl)
            .filter((url): url is string => Boolean(url))}
        />
      )}

      {!productStory && storySummary && (
        <section className="relative px-4 py-28 sm:px-8 lg:py-44">
          <div className="mx-auto max-w-[1600px]">
            <Reveal>
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#d4030a]">
                {storyKicker}
              </p>
              <h2 className="mt-9 max-w-[12ch] text-[clamp(3.3rem,7.5vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.065em]">
                {storyHeadline}
              </h2>
            </Reveal>
            <div className="mt-16 lg:ml-[24%] lg:mt-28">
              <ScrollRevealText className="max-w-[30ch] text-[clamp(1.8rem,3.4vw,4.25rem)] font-medium leading-[1.08] tracking-[-0.045em]">
                {storySummary}
              </ScrollRevealText>
            </div>
          </div>
        </section>
      )}

      {!productStory && (storyMedia.length > 0 || storyChapters.length > 0) && (
        <section className="border-y border-[#9faaae] px-4 py-24 sm:px-8 lg:py-40">
          <div className="mx-auto max-w-[1600px]">
            {storyChapters.length > 0 ? (
              <div className="space-y-28 lg:space-y-48">
                {storyChapters.map((chapter, index) => {
                  const media = storyMedia[index];
                  const content = (
                    <Reveal className="flex flex-col justify-center py-8 lg:py-16">
                      <span className="font-sans text-[10px] tracking-[0.16em] text-[#d4030a]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-7 max-w-[12ch] text-[clamp(2.8rem,5vw,6rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                        {chapter.title}
                      </h3>
                      <p className="mt-8 max-w-[42ch] text-lg leading-relaxed text-[#5c656a]">
                        {chapter.body}
                      </p>
                    </Reveal>
                  );

                  return (
                    <div
                      key={`${chapter.title}-${index}`}
                      className="grid gap-10 lg:grid-cols-12 lg:gap-16"
                    >
                      <div
                        className={
                          index % 2 === 0
                            ? "lg:col-span-5"
                            : "lg:order-2 lg:col-span-5 lg:col-start-8"
                        }
                      >
                        {content}
                      </div>
                      {media && (
                        <div
                          className={
                            index % 2 === 0
                              ? "lg:col-span-7"
                              : "lg:order-1 lg:col-span-7"
                          }
                        >
                          <CinematicMedia
                            media={media}
                            productName={product.name}
                            index={index}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-12">
                {storyMedia.map((media, index) => (
                  <CinematicMedia
                    key={media.id}
                    media={media}
                    productName={product.name}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {(technicalFacts.length > 0 ||
        (product.custom_fields && product.custom_fields.length > 0)) && (
        <section className="px-4 py-28 sm:px-8 lg:py-44">
          <div className="mx-auto max-w-[1600px]">
            <Reveal>
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#d4030a]">
                In detail
              </p>
              <h2 className="mt-9 max-w-[8ch] text-[clamp(3.3rem,7.5vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.065em]">
                Every choice, considered.
              </h2>
            </Reveal>

            {technicalFacts.length > 0 && (
              <dl className="mt-20 grid gap-x-10 gap-y-12 border-t border-[#9faaae] pt-10 sm:grid-cols-2 lg:mt-28 lg:grid-cols-4">
                {technicalFacts.map((fact, index) => (
                  <Reveal key={fact.label} delay={index * 0.06}>
                    <dt className="font-sans text-[10px] uppercase tracking-[0.14em] text-[#5c656a]">
                      {fact.label}
                    </dt>
                    <dd className="mt-5 break-words text-xl font-medium tracking-tight">
                      {fact.value}
                    </dd>
                  </Reveal>
                ))}
              </dl>
            )}

            <ProductCustomFields
              customFields={product.custom_fields?.filter(
                (field) => !field.key.startsWith("product_story."),
              )}
              theme="light"
            />
          </div>
        </section>
      )}

      <section className="relative border-t border-[#9faaae] px-4 py-28 sm:px-8 lg:py-44">
        <div className="relative mx-auto grid max-w-[1600px] gap-20 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#d4030a]">
              Your configuration
            </p>
            <h2 className="mt-9 max-w-[9ch] text-[clamp(3.8rem,8vw,9rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
              Ready when you are.
            </h2>
          </Reveal>

          <Reveal className="border-t border-[#9faaae] pt-8 lg:col-span-5">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="max-w-[22ch] text-2xl font-medium leading-tight">
                  {product.name}
                </p>
                {selectedVariant?.options_text && (
                  <p className="mt-2 text-sm text-[#5c656a]">
                    {selectedVariant.options_text}
                  </p>
                )}
              </div>
              {displayPrice && (
                <p className="whitespace-nowrap text-2xl font-semibold">
                  {displayPrice}
                </p>
              )}
            </div>
            <div className="mt-8">{purchaseControls}</div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
