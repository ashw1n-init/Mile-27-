import { beforeEach, describe, expect, it, vi } from "vitest";
import { playTactilePress } from "../tactile-feedback";

describe("playTactilePress", () => {
  const vibrate = vi.fn();

  function setReducedMotion(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches }) as MediaQueryList),
    });
  }

  beforeEach(() => {
    vibrate.mockReset();
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: vibrate,
    });
  });

  it("uses one subtle vibration pulse and animates the control and disc", () => {
    setReducedMotion(false);
    const control = document.createElement("button");
    const disc = document.createElement("span");
    disc.dataset.tactileDisc = "";
    control.append(disc);
    const controlAnimate = vi.fn();
    const discAnimate = vi.fn();
    Object.defineProperty(control, "animate", { value: controlAnimate });
    Object.defineProperty(disc, "animate", { value: discAnimate });

    playTactilePress(control);

    expect(vibrate).toHaveBeenCalledWith(24);
    expect(controlAnimate).toHaveBeenCalledOnce();
    expect(discAnimate).toHaveBeenCalledOnce();
  });

  it("keeps haptic feedback but skips animation for reduced motion", () => {
    setReducedMotion(true);
    const control = document.createElement("button");
    const animate = vi.fn();
    Object.defineProperty(control, "animate", { value: animate });

    playTactilePress(control);

    expect(vibrate).toHaveBeenCalledWith(24);
    expect(animate).not.toHaveBeenCalled();
  });
});
