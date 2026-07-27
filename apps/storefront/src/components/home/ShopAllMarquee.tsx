import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ShopAllMarqueeProps {
  basePath: string;
}

const marqueeItems = Array.from({ length: 4 });

export function ShopAllMarquee({ basePath }: ShopAllMarqueeProps) {
  return (
    <section className="overflow-hidden bg-white text-black">
      <Link
        href={`${basePath}/products`}
        className="group/shop-marquee relative flex min-h-40 items-center overflow-hidden py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#d4030a] sm:min-h-48"
      >
        <span className="sr-only">Shop all products</span>
        <span
          aria-hidden="true"
          className="shop-all-marquee-track flex w-max items-center whitespace-nowrap will-change-transform"
        >
          {marqueeItems.map((_, index) => (
            <span
              key={index}
              className="flex shrink-0 items-center text-[clamp(4rem,10vw,11rem)] font-semibold leading-[0.76] tracking-[-0.075em]"
            >
              <span className="px-[3vw]">Shop Now</span>
              <span className="mx-[1vw] flex size-[0.6em] items-center justify-center rounded-full border border-black/45 transition-colors duration-300 group-hover/shop-marquee:border-[#d4030a] group-hover/shop-marquee:bg-[#d4030a] group-hover/shop-marquee:text-black">
                <ArrowUpRight className="size-[0.38em]" strokeWidth={1.5} />
              </span>
            </span>
          ))}
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9),transparent_12%,transparent_88%,rgba(255,255,255,0.9))]"
        />
      </Link>
    </section>
  );
}
