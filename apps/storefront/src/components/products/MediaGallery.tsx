"use client";

import type { Media } from "@spree/sdk";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ZoomIn } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_MAX_VERTICAL_PX = 75;
const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIElEQVQYV2P4////MwwMDAxMDAwMDGQJMJCvkGwNZCsEAGebBwVss9lRAAAAAElFTkSuQmCC";

const LazyMediaLightbox = dynamic(
  () =>
    import("@/components/products/MediaLightbox").then((mod) => ({
      default: mod.MediaLightbox,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-zinc-950/95" aria-hidden="true" />
    ),
  },
);

interface MediaGalleryProps {
  images: Media[];
  productName: string;
  activeIndex?: number | null;
  theme?: "light" | "dark";
}

function getMainImageUrl(media: Media | undefined): string | null {
  if (!media) return null;
  return media.xlarge_url || media.large_url || media.original_url || null;
}

export function MediaGallery(props: MediaGalleryProps) {
  const { images, productName, activeIndex, theme = "light" } = props;
  const t = useTranslations("products");
  const reduceMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(activeIndex ?? 0);
  const [direction, setDirection] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mainImageErrorUrl, setMainImageErrorUrl] = useState<string | null>(
    null,
  );
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;
  const safeIndex = Math.max(0, Math.min(selectedIndex, images.length - 1));

  useEffect(() => {
    if (
      activeIndex == null ||
      activeIndex < 0 ||
      activeIndex >= images.length ||
      activeIndex === selectedIndexRef.current
    ) {
      return;
    }
    setDirection(activeIndex > selectedIndexRef.current ? 1 : -1);
    setSelectedIndex(activeIndex);
    setMainImageErrorUrl(null);
  }, [activeIndex, images.length]);

  const selectImage = useCallback(
    (index: number) => {
      const nextIndex = (index + images.length) % images.length;
      setDirection(nextIndex > safeIndex ? 1 : -1);
      setSelectedIndex(nextIndex);
      setMainImageErrorUrl(null);
    },
    [images.length, safeIndex],
  );

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    suppressClickRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      const touch = event.changedTouches[0];
      if (!start || !touch || images.length <= 1) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (
        Math.abs(dx) < SWIPE_THRESHOLD_PX ||
        Math.abs(dy) > SWIPE_MAX_VERTICAL_PX
      ) {
        return;
      }
      suppressClickRef.current = true;
      selectImage(safeIndex + (dx < 0 ? 1 : -1));
    },
    [images.length, safeIndex, selectImage],
  );

  if (images.length === 0) {
    return (
      <div className="relative min-h-[48vh] w-full">
        <ProductImage
          src={null}
          alt={productName}
          fill
          className="object-contain"
          iconClassName="h-24 w-24"
        />
      </div>
    );
  }

  const selectedImage = images[safeIndex];
  const mainImageUrl = getMainImageUrl(selectedImage);
  const showMainImage = mainImageUrl && mainImageErrorUrl !== mainImageUrl;

  const isDark = theme === "dark";

  return (
    <div className="relative flex min-h-[40vh] w-full flex-col justify-center sm:min-h-[52vh] lg:min-h-[64vh]">
      <button
        type="button"
        className={`group relative min-h-[36vh] w-full touch-pan-y overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-offset-4 sm:min-h-[44vh] lg:min-h-[60vh] ${
          isDark
            ? "focus-visible:ring-[#ffffff]"
            : "focus-visible:ring-zinc-950"
        }`}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          if (showMainImage) setIsZoomed(true);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={t("openImageZoom")}
        disabled={!showMainImage}
      >
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={`${selectedImage.id}-${safeIndex}`}
            custom={direction}
            initial={
              reduceMotion
                ? false
                : {
                    x: `${direction * 7}%`,
                    scale: 0.965,
                    opacity: 0.35,
                    filter: "blur(7px)",
                    clipPath:
                      direction > 0 ? "inset(0 0 0 28%)" : "inset(0 28% 0 0)",
                  }
            }
            animate={{
              x: "0%",
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              clipPath: "inset(0 0 0 0)",
            }}
            exit={
              reduceMotion
                ? undefined
                : {
                    x: `${direction * -4}%`,
                    scale: 1.018,
                    opacity: 0,
                    filter: "blur(5px)",
                    clipPath:
                      direction > 0 ? "inset(0 32% 0 0)" : "inset(0 0 0 32%)",
                  }
            }
            transition={{
              duration: reduceMotion ? 0.12 : 0.78,
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: reduceMotion ? 0.12 : 0.42 },
              filter: { duration: reduceMotion ? 0 : 0.5 },
            }}
            className="absolute inset-0"
          >
            <ProductImage
              src={mainImageUrl}
              alt={selectedImage.alt || productName}
              fill
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              fetchPriority="high"
              loading="eager"
              priority
              quality={90}
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 60vw, 48vw"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              iconClassName="h-24 w-24"
              onError={() => mainImageUrl && setMainImageErrorUrl(mainImageUrl)}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {!reduceMotion && (
            <motion.span
              key={`scan-${selectedImage.id}-${safeIndex}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-[8%] z-10 w-px bg-[#ff4d20]/70"
              initial={{ left: direction > 0 ? "18%" : "82%", opacity: 0 }}
              animate={{
                left: direction > 0 ? "86%" : "14%",
                opacity: [0, 0.8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>

        {showMainImage && (
          <span
            className={`absolute bottom-3 right-3 grid size-10 place-items-center border opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${
              isDark
                ? "border-white/20 bg-black/80 text-white"
                : "border-zinc-300 bg-[#ffffff]/90 text-zinc-700"
            }`}
          >
            <ZoomIn className="size-4" aria-hidden="true" />
          </span>
        )}
      </button>

      {images.length > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2" role="tablist">
            {images.map((image, index) => (
              <button
                type="button"
                key={image.id}
                onClick={() => selectImage(index)}
                className={`h-1 transition-[width,background-color] duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 ${
                  index === safeIndex
                    ? isDark
                      ? "w-10 bg-[#d4030a]"
                      : "w-10 bg-zinc-950"
                    : isDark
                      ? "w-4 bg-white/20 hover:bg-white/45"
                      : "w-4 bg-zinc-300 hover:bg-zinc-500"
                }`}
                aria-label={`${index + 1} / ${images.length}`}
                aria-selected={index === safeIndex}
                role="tab"
              />
            ))}
          </div>

          <div className="flex items-center">
            <span
              className={`mr-4 font-sans text-[10px] tabular-nums ${
                isDark ? "text-[#9faaae]" : "text-zinc-500"
              }`}
            >
              {String(safeIndex + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => selectImage(safeIndex - 1)}
              className={`grid size-11 place-items-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px ${
                isDark
                  ? "border-white/20 text-white hover:bg-white hover:text-black focus-visible:outline-white"
                  : "border-zinc-300 text-zinc-800 hover:bg-zinc-950 hover:text-white focus-visible:outline-zinc-950"
              }`}
              aria-label="Previous image"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => selectImage(safeIndex + 1)}
              className={`-ml-px grid size-11 place-items-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px ${
                isDark
                  ? "border-white/20 text-white hover:bg-white hover:text-black focus-visible:outline-white"
                  : "border-zinc-300 text-zinc-800 hover:bg-zinc-950 hover:text-white focus-visible:outline-zinc-950"
              }`}
              aria-label="Next image"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {isZoomed && showMainImage && (
        <LazyMediaLightbox
          images={images}
          activeIndex={safeIndex}
          productName={productName}
          onClose={() => setIsZoomed(false)}
          onNavigate={selectImage}
        />
      )}
    </div>
  );
}
