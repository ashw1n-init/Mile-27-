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
    imageAlt: "Editorial panorama of full-face motorcycle helmets",
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
    imageAlt: "Editorial panorama of helmeted motorcycle riders",
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
    imageAlt: "Editorial panorama of premium motorcycle protection",
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
    imageAlt: "Editorial panorama of helmets and riding equipment",
    focus: "Carry / Protect",
  },
];

interface HeroCarouselProps {
  slides: HeroSlide[];
  basePath: string;
}

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
      className="apex-hero relative flex min-h-[78svh] flex-col overflow-hidden bg-[#090909] text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d4030a] sm:min-h-[80svh] lg:min-h-[82svh]"
    >
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(212,3,10,.18),transparent_26%),radial-gradient(circle_at_72%_44%,rgba(255,255,255,.08),transparent_43%)]" />
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeSlide.id}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: "easeOut" }}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <motion.div
              initial={{ x: reduceMotion ? 0 : direction > 0 ? 36 : -36 }}
              animate={{ x: 0 }}
              exit={{ x: reduceMotion ? 0 : direction > 0 ? -24 : 24 }}
              transition={{
                duration: reduceMotion ? 0 : 0.72,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-0"
            >
              <Image
                src={activeSlide.image}
                alt={activeSlide.imageAlt}
                fill
                priority={activeIndex === 0}
                loading={activeIndex === 0 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 84vw"
                className="hero-duotone object-cover object-center"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden grid-cols-3 items-center px-8 py-7 font-sans text-[9px] font-medium uppercase tracking-[.18em] text-white/55 md:grid lg:px-12">
          <span>{activeSlide.category}</span>
          <span className="text-center">
            {String(activeIndex + 1).padStart(2, "0")}—
            {String(slideCount).padStart(2, "0")}
          </span>
          <span className="text-right">{activeSlide.focus}</span>
        </div>

        <div className="pointer-events-none relative z-20 flex flex-1 items-center px-5 pb-28 pt-16 [perspective:1400px] sm:px-8 md:px-12 lg:pb-24">
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
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={activeSlide.id}
                custom={direction}
                initial={{ y: reduceMotion ? 0 : 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reduceMotion ? 0 : -18, opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.58,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative mt-6 max-w-[92vw] overflow-hidden text-left lg:max-w-[62vw]"
              >
                <p className="mb-5 font-sans text-[9px] font-semibold uppercase tracking-[.2em] text-[#ef1a22] sm:text-[10px]">
                  {activeSlide.category} / Curated 027
                </p>
                <h1 className="max-w-[9ch] text-[clamp(4.2rem,10.2vw,11rem)] font-semibold leading-[0.73] tracking-[-0.09em]">
                  {activeSlide.title}
                </h1>
                <p className="mt-7 max-w-[30rem] pl-1 text-sm leading-relaxed text-white/58 sm:text-base lg:ml-[18vw]">
                  {activeSlide.kicker}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="absolute inset-x-4 bottom-4 z-30 flex items-end gap-3 sm:inset-x-6 md:inset-x-8 lg:inset-x-12">
          <nav
            aria-label="Hero chapters"
            className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-full bg-white/[.08] p-1.5 backdrop-blur-xl"
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
                  className={`relative min-h-11 min-w-[9rem] flex-1 rounded-full px-4 text-left font-sans text-[10px] font-semibold uppercase tracking-[.11em] transition-[color,background-color] sm:min-w-32 md:min-w-0 md:text-center ${
                    isActive
                      ? "bg-white text-black"
                      : "text-white/55 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="mr-2 text-[8px] opacity-45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {slide.category}
                  {isActive && (
                    <motion.span
                      layoutId="hero-chapter-active"
                      className="absolute left-3 top-1/2 size-1 -translate-y-1/2 rounded-full bg-[#d4030a] md:left-4"
                    />
                  )}
                </button>
              );
            })}
          </nav>
          <Link
            href={`${basePath}${activeSlide.href}`}
            className="group flex min-h-14 shrink-0 items-center justify-between gap-8 rounded-full bg-[#d4030a] px-6 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-white hover:text-black md:min-w-60"
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
