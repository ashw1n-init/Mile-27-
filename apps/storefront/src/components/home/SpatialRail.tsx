"use client";

import type { Product } from "@spree/sdk";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";

interface SpatialRailProps {
  basePath: string;
  products: Product[];
}

const railSpring = {
  type: "spring",
  stiffness: 280,
  damping: 30,
  mass: 0.72,
} as const;

export function SpatialRail({ basePath, products }: SpatialRailProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reduceMotion = useReducedMotion();
  const activeProduct = products[activeIndex];

  function selectProduct(index: number) {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  }

  function move(nextDirection: 1 | -1) {
    setDirection(nextDirection);
    setActiveIndex(
      (current) =>
        (current + nextDirection + products.length) % products.length,
    );
  }

  function handleDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } },
  ) {
    if (Math.abs(info.offset.x) < 48) return;
    move(info.offset.x > 0 ? -1 : 1);
  }

  return (
    <section
      aria-labelledby="spatial-rail-title"
      className="overflow-hidden bg-white px-5 pb-8 pt-16 text-black sm:px-8 sm:pb-10 sm:pt-20"
    >
      <h2 id="spatial-rail-title" className="sr-only">
        Explore the collection
      </h2>

      <div
        className="mx-auto hidden max-w-[1800px] grid-cols-6 items-end gap-2 md:grid"
        role="tablist"
        aria-label="Collection product rail"
      >
        {products.map((product, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              type="button"
              key={product.id}
              role="tab"
              aria-selected={isActive}
              aria-controls="spatial-rail-stage"
              onClick={() => selectProduct(index)}
              className="group/product relative min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              <motion.span
                className="relative block aspect-[1/1.05] origin-bottom"
                animate={{
                  y: isActive ? -18 : 0,
                  scale: isActive ? 1.06 : 0.92,
                  rotateY: isActive ? 0 : index < activeIndex ? 11 : -11,
                }}
                transition={reduceMotion ? { duration: 0 } : railSpring}
                style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
              >
                <ProductImage
                  src={product.thumbnail_url}
                  alt=""
                  fill
                  sizes="17vw"
                  className="object-contain p-[3%]"
                />
              </motion.span>
              <span className="mt-4 block overflow-hidden text-[clamp(0.7rem,0.85vw,0.92rem)] font-medium leading-[1.12] tracking-[-0.025em]">
                {isActive && (
                  <motion.span
                    layoutId="desktop-active-product-pointer"
                    transition={railSpring}
                    className="mb-2 block text-base leading-none"
                  >
                    ▲
                  </motion.span>
                )}
                <span className={isActive ? "text-black" : "text-black/30"}>
                  {product.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <motion.div
        id="spatial-rail-stage"
        role="tabpanel"
        tabIndex={0}
        className="relative mx-auto flex h-[min(105vw,34rem)] max-w-[36rem] cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black md:hidden"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") move(-1);
          if (event.key === "ArrowRight") move(1);
        }}
        drag={reduceMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.06}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          key={activeProduct.id}
          initial={
            reduceMotion
              ? false
              : { x: direction * 90, rotateY: direction * -8 }
          }
          animate={{ x: 0, rotateY: 0 }}
          transition={reduceMotion ? { duration: 0 } : railSpring}
          className="relative h-[82%] w-[86%]"
          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
        >
          <Link
            href={`${basePath}/products/${activeProduct.slug}`}
            className="block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            aria-label={`View ${activeProduct.name}`}
          >
            <ProductImage
              src={activeProduct.thumbnail_url}
              alt={activeProduct.name}
              fill
              sizes="86vw"
              className="object-contain"
            />
            <span className="absolute bottom-2 right-2 flex size-10 items-center justify-center rounded-full bg-black text-white">
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </motion.div>
      </motion.div>

      <div className="mx-auto mt-3 max-w-[1800px] md:hidden">
        <div className="relative h-10 overflow-hidden" aria-live="polite">
          <motion.div
            className="absolute left-0 top-0 w-full"
            animate={{ y: `-${activeIndex * 2.5}rem` }}
            transition={reduceMotion ? { duration: 0 } : railSpring}
          >
            {products.map((product, index) => (
              <button
                type="button"
                key={product.id}
                role="tab"
                aria-selected={activeIndex === index}
                onClick={() => selectProduct(index)}
                className={`flex h-10 w-full items-center gap-3 text-left text-[1.35rem] font-medium leading-none tracking-[-0.04em] ${
                  activeIndex === index ? "text-black" : "text-black/25"
                }`}
              >
                <span aria-hidden="true" className="text-black/70">
                  -
                </span>
                <span className="truncate">{product.name}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3 text-sm md:mt-8">
        <button
          type="button"
          onClick={() => move(-1)}
          className="flex size-8 items-center justify-center transition-transform hover:-translate-x-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          aria-label="Previous product"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
        </button>
        <span className="min-w-12 text-center text-xs tabular-nums text-black/70">
          {activeIndex + 1} / {products.length}
        </span>
        <button
          type="button"
          onClick={() => move(1)}
          className="flex size-8 items-center justify-center transition-transform hover:translate-x-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          aria-label="Next product"
        >
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
