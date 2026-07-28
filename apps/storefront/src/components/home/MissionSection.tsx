"use client";

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

const missionWords =
  "We make every mile more considered, pairing serious protection with gear that earns its place on the ride.".split(
    " ",
  );

interface MissionWordProps {
  index: number;
  progress: MotionValue<number>;
  word: string;
}

function MissionWord({ index, progress, word }: MissionWordProps) {
  const reduceMotion = useReducedMotion();
  const revealRange = 0.66 / Math.max(missionWords.length - 1, 1);
  const start = 0.08 + index * revealRange;
  const opacity = useTransform(progress, [start, start + 0.14], [0.16, 1]);
  const y = useTransform(progress, [start, start + 0.14], ["0.24em", "0em"]);

  return (
    <motion.span
      className="inline-block will-change-transform"
      style={reduceMotion ? undefined : { opacity, y }}
    >
      {word}
    </motion.span>
  );
}

export function MissionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const markerScale = useTransform(scrollYProgress, [0, 0.9], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[240dvh] overflow-clip bg-white text-zinc-950 motion-reduce:min-h-[100dvh] sm:min-h-[260dvh] sm:motion-reduce:min-h-[100dvh]"
      aria-labelledby="mission-title"
    >
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-between overflow-hidden px-5 py-6 motion-reduce:static sm:px-8 sm:py-8 lg:px-12">
        <div className="flex items-start justify-between gap-6">
          <h2
            id="mission-title"
            className="text-[clamp(2rem,4vw,5rem)] font-medium leading-none tracking-[-0.065em]"
          >
            Our mission
          </h2>
          <motion.span
            aria-hidden="true"
            className="mt-3 h-1.5 w-[clamp(4rem,11vw,12rem)] origin-left bg-[#d4030a]"
            style={reduceMotion ? undefined : { scaleX: markerScale }}
          />
        </div>

        <p className="max-w-[17ch] text-balance text-[clamp(3.35rem,7.3vw,9.4rem)] font-medium leading-[0.88] tracking-[-0.075em] sm:max-w-[18ch]">
          {missionWords.map((word, index) => (
            <span key={`${word}-${index}`} className="mr-[0.22em] inline-block">
              <MissionWord
                index={index}
                progress={scrollYProgress}
                word={word}
              />
            </span>
          ))}
        </p>

        <p className="max-w-[27ch] text-sm leading-relaxed text-zinc-500">
          A sharper edit of the equipment that keeps riders moving with more
          confidence.
        </p>
      </div>
    </section>
  );
}
