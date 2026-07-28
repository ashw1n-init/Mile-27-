"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { DirectoryBrand } from "@/components/home/BrandsDirectory";
import { ProductImage } from "@/components/ui/product-image";

interface BrandsDirectoryShowcaseProps {
  basePath: string;
  brands: DirectoryBrand[];
}

const imageEase = [0.22, 1, 0.36, 1] as const;
const opticalFilter = "brightness(1.08) contrast(1.04) blur(12px)";
const resolvedFilter = "brightness(1) contrast(1) blur(0px)";
const closedAperture = "inset(48% 0 48% 0 round 2rem)";

export function BrandsDirectoryShowcase({
  basePath,
  brands,
}: BrandsDirectoryShowcaseProps) {
  const [activeBrand, setActiveBrand] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reduceMotion = useReducedMotion();
  const active = brands[activeBrand];

  function selectBrand(index: number) {
    if (index === activeBrand) return;
    setDirection(index > activeBrand ? 1 : -1);
    setActiveBrand(index);
  }

  return (
    <section
      aria-labelledby="brands-directory-title"
      className="spatial-home-island overflow-hidden px-5 py-20 text-black sm:px-8 sm:py-28 lg:px-10 lg:py-36"
    >
      <div className="mx-auto max-w-[1800px]">
        <div className="flex items-baseline justify-between gap-6">
          <h2
            id="brands-directory-title"
            className="text-[clamp(2rem,4vw,5rem)] font-medium leading-none tracking-[-0.065em]"
          >
            Brands Directory
          </h2>
          <span className="hidden font-sans text-[10px] uppercase tracking-[0.14em] text-black/45 sm:block">
            Select a maker
          </span>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[1.12fr_1fr] lg:items-stretch lg:gap-16">
          <div className="relative min-h-[31rem] overflow-hidden rounded-[2rem] bg-[#eef0ee] sm:min-h-[38rem] lg:min-h-0">
            <span
              aria-hidden="true"
              className="absolute left-5 top-5 z-20 font-sans text-[10px] tracking-[0.14em] text-black/45 sm:left-7 sm:top-7"
            >
              {String(activeBrand + 1).padStart(2, "0")} /{" "}
              {String(brands.length).padStart(2, "0")}
            </span>
            <span
              aria-hidden="true"
              className="absolute right-5 top-5 z-20 font-sans text-[9px] uppercase tracking-[0.16em] text-black/40 sm:right-7 sm:top-7"
            >
              Featured equipment
            </span>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: direction * 18,
                        scale: 0.95,
                        clipPath: closedAperture,
                        filter: opticalFilter,
                      }
                }
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: [0, 1, 1],
                        y: [direction * 18, direction * 5, 0],
                        scale: [0.95, 0.988, 1],
                        clipPath: [
                          closedAperture,
                          "inset(13% 0 13% 0 round 2rem)",
                          "inset(0% 0 0% 0 round 2rem)",
                        ],
                        filter: [
                          opticalFilter,
                          "brightness(1.025) contrast(1.02) blur(3px)",
                          resolvedFilter,
                        ],
                      }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: direction * -10,
                        scale: 0.985,
                        clipPath: "inset(44% 0 44% 0 round 2rem)",
                        filter: "brightness(1.04) contrast(1.03) blur(8px)",
                        transition: { duration: 0.38, ease: imageEase },
                      }
                }
                transition={{
                  duration: reduceMotion ? 0.16 : 0.86,
                  times: [0, 0.54, 1],
                  ease: imageEase,
                }}
              >
                {!reduceMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-[4%] z-30 w-[24%] bg-gradient-to-r from-transparent via-[#d4030a]/12 to-transparent blur-xl"
                    initial={{
                      left: direction > 0 ? "-28%" : "104%",
                      opacity: 0,
                    }}
                    animate={{
                      left:
                        direction > 0
                          ? ["-28%", "42%", "104%"]
                          : ["104%", "42%", "-28%"],
                      opacity: [0, 0.55, 0],
                    }}
                    transition={{
                      duration: 0.82,
                      times: [0, 0.52, 1],
                      ease: imageEase,
                    }}
                  />
                )}
                {active.product ? (
                  <Link
                    href={`${basePath}/products/${active.product.slug}`}
                    className="group/stage absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-black"
                    aria-label={`View ${active.product.name}`}
                  >
                    <ProductImage
                      src={active.product.thumbnailUrl}
                      alt={active.product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 52vw"
                      className="object-contain p-[10%] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover/stage:scale-[1.025]"
                    />
                    <span className="absolute bottom-5 left-5 right-5 z-20 flex items-end justify-between gap-6 rounded-[1.25rem] bg-white/80 p-4 shadow-[0_12px_36px_rgba(56,61,64,0.1)] backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7">
                      <span>
                        <span className="block font-sans text-[9px] uppercase tracking-[0.15em] text-black/45">
                          {active.name} selection
                        </span>
                        <span className="mt-1.5 block max-w-[28ch] text-sm font-medium leading-tight tracking-[-0.025em]">
                          {active.product.name}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="size-5 shrink-0 transition-transform duration-300 group-hover/stage:-translate-y-1 group-hover/stage:translate-x-1"
                        strokeWidth={1.4}
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-sans text-[10px] uppercase tracking-[0.14em] text-black/35">
                    Product image unavailable
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <nav aria-label="Featured brands" className="self-stretch">
            <ul className="grid h-full sm:grid-cols-2">
              {brands.map((brand, index) => {
                const isActive = activeBrand === index;

                return (
                  <li key={brand.id} className="p-1.5 sm:odd:pr-2 sm:even:pl-2">
                    <Link
                      href={`${basePath}/c/${brand.permalink}`}
                      onPointerEnter={() => selectBrand(index)}
                      onFocus={() => selectBrand(index)}
                      onClick={() => selectBrand(index)}
                      aria-current={isActive ? "true" : undefined}
                      className={`group/brand flex h-full min-h-20 items-center justify-between gap-4 rounded-[1.25rem] px-4 py-5 text-[clamp(1.7rem,2.8vw,3.35rem)] font-medium leading-none tracking-[-0.06em] transition-[color,background-color,transform] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4030a] lg:min-h-28 ${
                        isActive
                          ? "bg-black text-white shadow-[0_14px_36px_rgba(23,23,24,0.14)]"
                          : "text-black/30 hover:translate-x-1 hover:bg-black/[0.04] hover:text-black/70"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={`h-px shrink-0 bg-[#d4030a] transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
                            isActive ? "w-7" : "w-0"
                          }`}
                        />
                        <span className="truncate">{brand.name}</span>
                      </span>
                      <ArrowUpRight
                        className={`size-4 shrink-0 transition-all duration-300 ${
                          isActive
                            ? "translate-x-0 translate-y-0 opacity-100"
                            : "-translate-x-1.5 translate-y-1 opacity-0"
                        }`}
                        strokeWidth={1.4}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
