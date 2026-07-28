import type { Category } from "@spree/sdk";
import { ArrowUpRight, Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MastercardFlatRoundedIcon,
  PayPalFlatRoundedIcon,
  VisaFlatRoundedIcon,
} from "react-svg-credit-card-payment-icons";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { isWholesaleEnabled } from "@/lib/spree";
import { CurrentYear } from "./CurrentYear";

interface FooterProps {
  rootCategories: Category[];
  basePath: string;
  locale: Locale;
}

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/mile27store/",
    Icon: Instagram,
  },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: Youtube },
  { label: "Facebook", href: "https://www.facebook.com/", Icon: Facebook },
];

export async function Footer({
  rootCategories,
  basePath,
  locale,
}: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tp = await getTranslations({ locale, namespace: "policies" });
  const wholesaleEnabled = isWholesaleEnabled();

  return (
    <footer className="m-0 rounded-none bg-white/80 px-5 pb-5 pt-16 text-zinc-950 shadow-[0_24px_80px_rgba(56,61,64,0.09)] backdrop-blur-xl sm:px-8 sm:pb-8 sm:pt-20 lg:px-10 lg:pb-10 lg:pt-24">
      <div className="mx-auto max-w-[1800px]">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="flex flex-col justify-between">
            <div className="max-w-[62rem]">
              <div className="mb-5 flex items-center justify-between gap-6 font-sans text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-[10px]">
                <span>Road equipment / performance edit</span>
                <span className="hidden sm:block">Kollam · India</span>
              </div>
              <Link
                href={basePath}
                aria-label="Mile 27 home"
                className="font-cal-sans group/wordmark relative block w-fit max-w-full overflow-visible pb-[0.12em] pt-[0.08em] text-[clamp(3.7rem,9.2vw,10.5rem)] font-semibold lowercase leading-[0.9] tracking-[-0.075em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
              >
                <span className="block pr-[0.04em] transition-[color,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover/wordmark:translate-x-[0.025em] group-hover/wordmark:text-[#d4030a]">
                  mile27store
                </span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-[0.14] bg-[#d4030a] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover/wordmark:scale-x-100"
                />
              </Link>
              <div className="mt-5 flex items-center gap-4 font-sans text-[9px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[10px]">
                <span>Est. 2019</span>
                <span aria-hidden="true" className="h-px w-8 bg-[#d4030a]" />
                <span>27 miles forward</span>
              </div>
            </div>
            <p className="mt-12 max-w-[29ch] text-sm leading-relaxed text-zinc-500 lg:mt-24">
              A sharper edit of helmets, riding gear, and the pieces that make
              every mile count.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
            <div>
              <h2 className="text-sm font-medium">Shop</h2>
              <ul className="mt-5 space-y-3 text-sm text-zinc-500">
                <li>
                  <Link
                    className="transition-colors hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
                    href={`${basePath}/products`}
                  >
                    {t("allProducts")}
                  </Link>
                </li>
                {rootCategories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <Link
                      className="transition-colors hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
                      href={`${basePath}/c/${category.permalink}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-medium">Account</h2>
              <ul className="mt-5 space-y-3 text-sm text-zinc-500">
                <li>
                  <Link
                    className="transition-colors hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
                    href={`${basePath}/account`}
                  >
                    {t("myAccount")}
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition-colors hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
                    href={`${basePath}/account/orders`}
                  >
                    {t("orderHistory")}
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition-colors hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
                    href={`${basePath}/cart`}
                  >
                    {t("cart")}
                  </Link>
                </li>
                {wholesaleEnabled && (
                  <li>
                    <Link
                      className="transition-colors hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
                      href={`${basePath}/wholesale`}
                    >
                      {t("wholesale")}
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <nav aria-label="Store policies">
              <h2 className="text-sm font-medium">Policies</h2>
              <ul className="mt-5 space-y-3 text-sm text-zinc-500">
                {POLICY_LINKS.map((policy) => (
                  <li key={policy.slug}>
                    <Link
                      className="transition-colors hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
                      href={`${basePath}/policies/${policy.slug}`}
                    >
                      {tp(policy.nameKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-16 rounded-[1.5rem] bg-black/[0.035] p-5 sm:mt-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <nav
              className="flex items-center gap-3"
              aria-label="Follow Mile 27"
            >
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Follow Mile 27 on ${label}`}
                  className="flex size-10 items-center justify-center rounded-full bg-white/80 shadow-[0_6px_18px_rgba(56,61,64,0.08)] transition-colors duration-300 hover:bg-zinc-950 hover:text-[#d4030a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
                >
                  <Icon className="size-4" strokeWidth={1.5} />
                </a>
              ))}
            </nav>

            <section
              className="flex items-center gap-2"
              aria-label="Accepted payment methods"
            >
              <VisaFlatRoundedIcon width={42} aria-label="Visa" />
              <MastercardFlatRoundedIcon width={42} aria-label="Mastercard" />
              <PayPalFlatRoundedIcon width={42} aria-label="PayPal" />
            </section>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
              <span>
                © <CurrentYear /> Mile 27
              </span>
              <Link
                href={`${basePath}/products`}
                className="group flex items-center gap-1 text-zinc-950 transition-colors hover:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
              >
                Shop the edit
                <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
