"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface CartButtonProps {
  overlay?: boolean;
  showLabel?: boolean;
}

export function CartButton({
  overlay = false,
  showLabel = false,
}: CartButtonProps) {
  const t = useTranslations("header");
  const { itemCount, openCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size={showLabel ? "default" : "icon-lg"}
      onClick={openCart}
      aria-label={t("openCart")}
      className={`relative gap-2 rounded-full px-3 ${overlay ? "text-white hover:bg-white/10" : "hover:bg-black/[0.055]"}`}
    >
      <ShoppingBag className="size-4.5" />
      {showLabel && (
        <span className="hidden text-xs font-semibold uppercase tracking-[0.08em] xl:inline">
          Bag
        </span>
      )}
      {mounted && itemCount > 0 && (
        <span className="flex min-w-5 items-center justify-center rounded-full bg-current/10 px-1.5 py-0.5 font-sans text-[9px]">
          {itemCount}
        </span>
      )}
    </Button>
  );
}
