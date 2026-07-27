"use client";

import { Minus, Plus } from "lucide-react";
import type * as React from "react";
import { Button } from "./button";

interface QuantityPickerProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
  size?: "sm" | "lg";
  theme?: "light" | "dark";
}

export function QuantityPicker({
  quantity,
  onDecrement,
  onIncrement,
  disabled = false,
  size = "sm",
  theme = "light",
}: QuantityPickerProps): React.JSX.Element {
  const buttonSize = size === "lg" ? "icon-lg" : "icon";
  const spanClass =
    size === "lg"
      ? "px-4 font-medium min-w-[3rem] text-center tabular-nums"
      : "px-3 py-2 text-sm font-medium min-w-[2rem] text-center tabular-nums";

  return (
    <div
      className={`flex h-16 items-center border px-0.5 ${
        theme === "dark"
          ? "border-white/25 text-white"
          : "border-zinc-300 text-zinc-950"
      }`}
    >
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        className={`rounded-none disabled:opacity-30 ${
          theme === "dark" ? "text-white hover:bg-white/10" : ""
        }`}
        disabled={disabled || quantity <= 1}
        onClick={onDecrement}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3" />
      </Button>
      <span className={spanClass}>{quantity}</span>
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        className={`rounded-none disabled:opacity-30 ${
          theme === "dark" ? "text-white hover:bg-white/10" : ""
        }`}
        disabled={disabled}
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
}
