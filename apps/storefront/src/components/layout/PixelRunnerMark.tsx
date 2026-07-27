"use client";

import type { DotLottie } from "@lottiefiles/dotlottie-web";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const RUNNER_ASSET = "/Pixel%20Stickman%20Running.red.json?v=d4030a";

interface PixelRunnerMarkProps {
  className?: string;
}

export function PixelRunnerMark({
  className = "",
}: PixelRunnerMarkProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    let animation: DotLottie | null = null;
    const controller = new AbortController();

    void Promise.all([
      import("@lottiefiles/dotlottie-web"),
      fetch(RUNNER_ASSET, { signal: controller.signal }).then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load the Mile 27 motion mark`);
        }
        return response.json() as Promise<Record<string, unknown>>;
      }),
    ])
      .then(([{ DotLottie }, data]) => {
        if (!active) return;

        const instance = new DotLottie({
          canvas,
          data,
          autoplay: !reducedMotion,
          loop: !reducedMotion,
          backgroundColor: "rgba(0,0,0,0)",
          layout: {
            fit: "contain",
            align: [0.5, 0.5],
          },
          renderConfig: {
            autoResize: true,
            devicePixelRatio: window.devicePixelRatio,
          },
          useFrameInterpolation: false,
        });
        animation = instance;

        if (reducedMotion) {
          instance.addEventListener("load", () => instance.setFrame(0));
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
      controller.abort();
      animation?.destroy();
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`block bg-transparent ${className}`}
      data-testid="header-pixel-runner"
    />
  );
}
