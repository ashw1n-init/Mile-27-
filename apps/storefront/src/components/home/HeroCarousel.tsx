"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

export interface HeroSlide {
  id: string;
  category: string;
  title: string;
  kicker: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  focus: string;
}

export const defaultHeroSlides: HeroSlide[] = [
  {
    id: "helmets",
    category: "Full Face",
    title: "HEAD FIRST.",
    kicker: "Protection shaped for the next corner.",
    cta: "Explore helmets",
    href: "/products",
    image: "/hero/helmet-frieze.png",
    imageAlt: "Editorial collage of full-face motorcycle helmets",
    focus: "Road / Sport",
  },
  {
    id: "gear",
    category: "Riding Gear",
    title: "MOVE CLEAN.",
    kicker: "Equipment designed around the rider, not the pose.",
    cta: "Explore riding gear",
    href: "/products",
    image: "/hero/helmet-frieze.png",
    imageAlt: "Editorial collage of helmeted motorcycle riders",
    focus: "Control / Comfort",
  },
  {
    id: "intercom",
    category: "Intercom",
    title: "CLEAR SIGNAL.",
    kicker: "Stay connected without leaving the ride.",
    cta: "Discover intercoms",
    href: "/products",
    image: "/hero/helmet-frieze.png",
    imageAlt: "Editorial collage of premium motorcycle protection",
    focus: "Solo / Group",
  },
  {
    id: "accessories",
    category: "Accessories",
    title: "FINISH THE KIT.",
    kicker: "The considered details behind a complete setup.",
    cta: "Explore accessories",
    href: "/products",
    image: "/hero/helmet-frieze.png",
    imageAlt: "Editorial collage of helmets and riding equipment",
    focus: "Carry / Protect",
  },
];

interface HeroCarouselProps {
  slides: HeroSlide[];
  basePath: string;
}

const spring = {
  type: "spring" as const,
  stiffness: 120,
  damping: 24,
  mass: 0.9,
};

export function HeroCarousel({ slides, basePath }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const heroRef = useRef<HTMLElement>(null);
  const touchStart = useRef(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.38,
    restDelta: 0.001,
  });
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 190,
    damping: 30,
    mass: 0.32,
  });
  const titleY = useTransform(smoothScrollProgress, [0, 1], ["0vh", "24vh"]);
  const titleDepth = useTransform(smoothScrollProgress, [0, 1], [0, -220]);
  const titleScale = useTransform(smoothScrollProgress, [0, 1], [1, 0.92]);
  const titleBend = useTransform(smoothScrollProgress, [0, 1], [0, 7.5]);
  const titleOpacity = useTransform(
    smoothScrollProgress,
    [0, 0.72, 1],
    [1, 0, 0],
  );
  const titleSkew = useTransform(smoothVelocity, [-2, 0, 2], [-1.35, 0, 1.35]);
  const activeSlide = slides[activeIndex] ?? slides[0];
  const slideCount = slides.length;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeIndex) return;
      setDirection(nextIndex > activeIndex ? 1 : -1);
      setActiveIndex(nextIndex);
    },
    [activeIndex],
  );

  const step = useCallback(
    (amount: 1 | -1) => {
      setDirection(amount);
      setActiveIndex((current) => (current + amount + slideCount) % slideCount);
    },
    [slideCount],
  );

  return (
    <section
      ref={heroRef}
      aria-roledescription="carousel"
      aria-label="Featured motorcycle equipment"
      onWheel={(event) => {
        if (Math.abs(event.deltaX) < 48 || Math.abs(event.deltaY) > 24) return;
        step(event.deltaX > 0 ? 1 : -1);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        const distance = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(distance) > 54) step(distance < 0 ? 1 : -1);
      }}
      className="apex-hero relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d4030a]"
    >
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeSlide.id}
            custom={direction}
            initial={{
              clipPath:
                direction > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
            }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{
              clipPath:
                direction > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
            }}
            transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <motion.div
              initial={{ x: direction > 0 ? "8%" : "-8%", scale: 1.06 }}
              animate={{ x: "0%", scale: 1 }}
              exit={{ x: direction > 0 ? "-6%" : "6%", scale: 1.03 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-[5%] bottom-[15%] top-[12%] sm:inset-x-[12%] sm:bottom-[13%] sm:top-[10%]"
            >
              <Image
                src={activeSlide.image}
                alt=""
                fill
                priority={activeIndex === 0}
                loading={activeIndex === 0 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 84vw"
                className="hero-duotone object-contain"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 top-5 z-20 hidden grid-cols-3 px-6 font-serif text-[clamp(1.2rem,2.2vw,2.8rem)] leading-none md:grid lg:px-12">
          <span>{activeSlide.category}</span>
          <span className="text-center">
            {String(activeIndex + 1).padStart(2, "0")}—
            {String(slideCount).padStart(2, "0")}
          </span>
          <span className="text-right">{activeSlide.focus}</span>
        </div>

        <div className="pointer-events-none relative z-20 flex flex-1 items-center justify-center px-4 [perspective:1200px]">
          <div className="absolute left-4 top-5 font-sans text-[10px] uppercase tracking-[0.14em] md:hidden">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(slideCount).padStart(2, "0")} — {activeSlide.category}
          </div>
          <motion.div
            className="will-change-transform"
            style={
              reduceMotion
                ? undefined
                : {
                    y: titleY,
                    z: titleDepth,
                    scale: titleScale,
                    rotateX: titleBend,
                    skewY: titleSkew,
                    opacity: titleOpacity,
                    transformOrigin: "50% 55%",
                    transformStyle: "preserve-3d",
                  }
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSlide.id}
                initial={{ y: direction > 0 ? 80 : -80 }}
                animate={{ y: 0 }}
                exit={{ y: direction > 0 ? -80 : 80 }}
                transition={spring}
                className="relative mt-6 text-center"
              >
                <h1 className="whitespace-nowrap text-[clamp(3.35rem,10.5vw,12rem)] font-semibold leading-[0.78] tracking-[-0.085em]">
                  {activeSlide.title}
                </h1>
                <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-white/62 sm:text-base">
                  {activeSlide.kicker}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="relative z-30 grid shrink-0 border-t border-white/25 md:grid-cols-[1fr_auto]">
          <nav
            aria-label="Hero chapters"
            className="flex min-w-0 overflow-x-auto"
          >
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show ${slide.category}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative min-h-16 min-w-[42vw] flex-1 border-r border-white/20 px-4 text-left font-serif text-lg transition-colors sm:min-w-36 md:min-w-0 md:px-6 md:text-2xl ${
                    isActive
                      ? "bg-[#d4030a] text-white"
                      : "bg-black text-white/72 hover:bg-white hover:text-black"
                  }`}
                >
                  <span className="block font-sans text-[8px] uppercase tracking-[0.14em] opacity-55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {slide.category}
                  {isActive && (
                    <motion.span
                      layoutId="hero-chapter-active"
                      className="absolute inset-x-0 top-0 h-[3px] bg-[#d4030a]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
          <Link
            href={`${basePath}${activeSlide.href}`}
            className="group flex min-h-16 items-center justify-between gap-8 bg-[#d4030a] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-black transition-colors hover:bg-white md:min-w-64 md:px-7"
          >
            {activeSlide.cta}
            <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Slide {activeIndex + 1} of {slideCount}: {activeSlide.category}.{" "}
        {activeSlide.kicker}
      </p>
    </section>
  );
}
