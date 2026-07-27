import { describe, expect, it } from "vitest";
import {
  getOptionValueLabel,
  parseCompoundOptionValue,
} from "@/lib/utils/filters";

describe("getOptionValueLabel", () => {
  it.each([
    ["S:Colour:White", "S · White"],
    ["M:Color:Semi Flat Black", "M · Semi Flat Black"],
    ["Size: L, Colour: N Grey", "L · N Grey"],
    ["Size: XL | Color: Black", "XL · Black"],
  ])("formats compound catalogue value %s", (value, expected) => {
    expect(getOptionValueLabel(value)).toBe(expected);
  });

  it("preserves ordinary option labels", () => {
    expect(getOptionValueLabel("Semi Flat Titanium")).toBe(
      "Semi Flat Titanium",
    );
  });

  it("returns structured size and colour data for the picker", () => {
    expect(parseCompoundOptionValue("M:Colour:Semi Flat Black")).toEqual({
      size: "M",
      color: "Semi Flat Black",
    });
    expect(parseCompoundOptionValue("Black")).toBeNull();
  });
});
