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
    <footer className="rounded-t-[2rem] bg-[#ffffff] px-5 pb-5 pt-16 text-zinc-950 sm:rounded-t-[3rem] sm:px-8 sm:pb-8 sm:pt-20 lg:rounded-t-[4rem] lg:px-10 lg:pb-10 lg:pt-24">
      <div className="mx-auto max-w-[1800px]">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="flex flex-col justify-between">
            <Link
              href={basePath}
              className="w-fit text-[clamp(4.8rem,13vw,14rem)] font-semibold leading-[0.72] tracking-[-0.1em] transition-transform duration-500 hover:translate-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
            >
              MILE 27
            </Link>
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

            <div>
              <h2 className="text-sm font-medium">Info</h2>
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
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-8 border-t border-zinc-950/15 pt-5 sm:mt-20 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex items-center gap-3" aria-label="Follow Mile 27">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Follow Mile 27 on ${label}`}
                className="flex size-10 items-center justify-center border border-zinc-950/20 transition-colors duration-300 hover:border-zinc-950 hover:bg-zinc-950 hover:text-[#d4030a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4030a]"
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
    </footer>
  );
}
