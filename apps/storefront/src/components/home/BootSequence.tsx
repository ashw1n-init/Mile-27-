"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const BOOT_SESSION_KEY = "mile27-home-boot-seen";
const MINIMUM_RUNTIME_MS = 2400;
const SKIP_DELAY_MS = 1000;
const EXIT_DURATION_MS = 920;
const logoSource =
  "/Mile_27_Store_-_India_s_Finest_Premiere_Helmets_and_Motorcycle_accessories_store.png";
const revealEase = [0.76, 0, 0.24, 1] as const;

type BootPhase = "active" | "exiting";

export function BootSequence() {
  const [mounted, setMounted] = useState(true);
  const [phase, setPhase] = useState<BootPhase>("active");
  const exitingRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(BOOT_SESSION_KEY) === "true") {
        setMounted(false);
        return;
      }
      window.sessionStorage.setItem(BOOT_SESSION_KEY, "true");
    } catch {
      // Storage can be unavailable in restricted browsing contexts.
    }

    const startedAt = window.performance.now();
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    let disposed = false;
    let exitTimer = 0;
    let minimumTimer = 0;

    function restoreDocument() {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleSkip);
      window.removeEventListener("pointerdown", handleSkip);
    }

    function finish() {
      if (disposed) return;
      restoreDocument();
      setMounted(false);
    }

    function beginExit() {
      if (disposed || exitingRef.current) return;
      exitingRef.current = true;
      setPhase("exiting");
      exitTimer = window.setTimeout(finish, EXIT_DURATION_MS);
    }

    function handleSkip() {
      if (window.performance.now() - startedAt < SKIP_DELAY_MS) return;
      beginExit();
    }

    window.addEventListener("keydown", handleSkip);
    window.addEventListener("pointerdown", handleSkip);

    const pageReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
          });
    const minimumRuntime = new Promise<void>((resolve) => {
      minimumTimer = window.setTimeout(resolve, MINIMUM_RUNTIME_MS);
    });

    void Promise.all([pageReady, minimumRuntime]).then(beginExit);

    return () => {
      disposed = true;
      window.clearTimeout(exitTimer);
      window.clearTimeout(minimumTimer);
      restoreDocument();
    };
  }, []);

  if (!mounted) return null;

  const isExiting = phase === "exiting";

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Mile 27 Store is loading"
      className="fixed inset-0 z-[200] overflow-hidden bg-black text-white"
      initial={false}
      animate={
        isExiting
          ? { clipPath: "inset(0 0 100% 0)" }
          : { clipPath: "inset(0 0 0% 0)" }
      }
      transition={
        reduceMotion ? { duration: 0.18 } : { duration: 0.9, ease: revealEase }
      }
    >
      <div className="absolute inset-0 flex items-center justify-center px-6 pb-20 sm:pb-16">
        <div className="relative aspect-[31/32] max-h-[68dvh] w-[min(72vw,27rem)]">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.14] grayscale"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.975 }}
            animate={{ opacity: 0.14, scale: 1 }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.8,
              ease: revealEase,
            }}
          >
            <Image
              src={logoSource}
              alt=""
              fill
              priority
              quality={90}
              sizes="(max-width: 640px) 72vw, 432px"
              className="object-contain"
            />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            initial={
              reduceMotion
                ? false
                : { clipPath: "inset(100% 0 0 0)", filter: "blur(5px)" }
            }
            animate={{ clipPath: "inset(0% 0 0 0)", filter: "blur(0px)" }}
            transition={{
              duration: reduceMotion ? 0.01 : 1.32,
              delay: reduceMotion ? 0 : 0.28,
              ease: revealEase,
            }}
          >
            <Image
              src={logoSource}
              alt="Mile 27 Store"
              fill
              priority
              quality={90}
              sizes="(max-width: 640px) 72vw, 432px"
              className="object-contain"
            />
          </motion.div>

          {!reduceMotion && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[7%] h-px bg-[#d4030a]"
              initial={{ bottom: "0%", opacity: 0 }}
              animate={{ bottom: ["0%", "100%", "100%"], opacity: [0, 1, 0] }}
              transition={{
                duration: 1.32,
                delay: 0.28,
                times: [0, 0.86, 1],
                ease: revealEase,
              }}
            />
          )}
        </div>
      </div>

      <motion.div
        className="absolute inset-x-5 bottom-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3 border-t border-white/20 pt-4 font-sans text-[8px] leading-none tracking-[0.12em] text-white/65 sm:inset-x-8 sm:bottom-7 sm:text-[10px] lg:inset-x-10"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0.01 : 0.72,
          delay: reduceMotion ? 0 : 0.72,
          ease: revealEase,
        }}
      >
        <span>mile27store</span>
        <span className="text-center">Kollam, Kerala, India</span>
        <span className="text-right">est.2019</span>
      </motion.div>

      <span className="sr-only">Press any key or click to enter.</span>
    </motion.div>
  );
}
