const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function playTactilePress(target: HTMLElement) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(24);
  }

  if (
    typeof window === "undefined" ||
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  ) {
    return;
  }

  target.animate(
    [
      { transform: "scale(1)", offset: 0 },
      { transform: "scale(0.985)", offset: 0.36 },
      { transform: "scale(1)", offset: 1 },
    ],
    { duration: 320, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );

  const disc = target.querySelector<HTMLElement>("[data-tactile-disc]");
  disc?.animate(
    [
      {
        opacity: 0,
        transform:
          "translate(-50%, -50%) scale(0.12) rotateX(78deg) rotateY(0deg)",
      },
      { opacity: 0.32, offset: 0.22 },
      {
        opacity: 0,
        transform:
          "translate(-50%, -50%) scale(1.45) rotateX(8deg) rotateY(180deg)",
      },
    ],
    { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );
}
