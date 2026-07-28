import type { Category } from "@spree/sdk";
import { User } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AnnouncementBand } from "@/components/layout/AnnouncementBand";
import { CartButton } from "@/components/layout/CartButton";
import { PixelRunnerMark } from "@/components/layout/PixelRunnerMark";
import { SearchToggle } from "@/components/layout/SearchToggle";
import { getActiveAnnouncements } from "@/lib/announcements";
import { BRAND_LOGO_PATH, BRAND_NAME } from "@/lib/brand";
import { isWholesaleEnabled } from "@/lib/spree";

const LazyMobileMenu = dynamic(
  () =>
    import("@/components/layout/MobileMenu").then((mod) => ({
      default: mod.MobileMenu,
    })),
  {
    loading: () => (
      <div className="inline-flex items-center justify-center h-10 w-10" />
    ),
  },
);

const LazyCountrySwitcher = dynamic(
  () =>
    import("@/components/layout/CountrySwitcher").then((mod) => ({
      default: mod.CountrySwitcher,
    })),
  {
    loading: () => (
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
);

interface HeaderProps {
  rootCategories: Category[];
  basePath: string;
  locale: Locale;
}

export async function Header({
  rootCategories,
  basePath,
  locale,
}: HeaderProps) {
  const t = await getTranslations({ locale, namespace: "header" });
  const wholesaleEnabled = isWholesaleEnabled();
  const announcements = getActiveAnnouncements({
    locale,
    audience: wholesaleEnabled ? "wholesale" : "retail",
  });
  const primaryCategories = rootCategories.slice(0, 4);

  return (
    <>
      <SearchToggle
        basePath={basePath}
        left={
          <div className="flex min-w-0 items-center gap-4 lg:gap-7">
            <LazyMobileMenu
              rootCategories={rootCategories}
              basePath={basePath}
              wholesaleEnabled={wholesaleEnabled}
            />
            <Link
              href={basePath || "/"}
              className="flex h-[4.5rem] shrink-0 items-center transition-opacity hover:opacity-70 xl:h-20"
              aria-label={BRAND_NAME}
            >
              <PixelRunnerMark className="size-12 xl:size-[3.65rem]" />
            </Link>
            <span className="hidden pl-2 font-sans text-[9px] uppercase leading-tight tracking-[0.16em] text-[#5c656a] xl:block">
              Road equipment
              <br />
              performance edit
            </span>
          </div>
        }
        center={
          <nav
            aria-label="Primary navigation"
            className="my-auto hidden h-12 items-center justify-center gap-1 rounded-full bg-black/[0.045] p-1.5 xl:flex"
          >
            <Link
              href={`${basePath}/products`}
              className="group flex h-9 items-center rounded-full bg-zinc-950 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_8px_22px_rgba(23,23,24,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4030a] xl:px-5"
            >
              <span className="mr-2 size-1.5 rounded-full bg-[#d4030a]" />
              Shop all
            </Link>
            {primaryCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`${basePath}/c/${category.permalink}`}
                className={`group flex h-9 max-w-48 items-center rounded-full px-4 text-[11px] uppercase tracking-[0.08em] transition-[background-color,color,transform] duration-300 hover:-translate-y-px hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4030a] xl:px-5 ${
                  index < 2 ? "font-semibold" : "text-[#5c656a]"
                }`}
              >
                <span className="truncate transition-colors group-hover:text-[#d4030a]">
                  {category.name}
                </span>
              </Link>
            ))}
          </nav>
        }
        rightStart={
          <div className="hidden items-center xl:flex">
            {/* Trade portal entry point — understated, secondary to the catalog nav.
              Only shown when the wholesale addon is enabled. */}
            {wholesaleEnabled && (
              <Link
                href={`${basePath}/wholesale`}
                className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-950"
              >
                {t("wholesale")}
              </Link>
            )}
            <LazyCountrySwitcher />
          </div>
        }
        rightEnd={
          <>
            {/* Account - desktop only */}
            <div className="hidden md:block">
              <Link
                href={`${basePath}/account`}
                aria-label={t("account")}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-zinc-950 transition-colors outline-none hover:bg-zinc-950/5 focus-visible:border-black focus-visible:[outline:1px_solid_black]"
              >
                <User className="size-4.5" aria-hidden="true" />
              </Link>
            </div>

            <CartButton showLabel />
          </>
        }
      />
      <AnnouncementBand announcements={announcements} basePath={basePath} />
      <Link
        href={basePath || "/"}
        aria-label={BRAND_NAME}
        className="fixed bottom-3 right-3 z-40 block transition-none sm:bottom-4 sm:right-4"
      >
        <Image
          src={BRAND_LOGO_PATH}
          alt={BRAND_NAME}
          width={934}
          height={1024}
          priority
          sizes="(min-width: 640px) 60px, 48px"
          className="h-12 w-auto object-contain sm:h-[3.75rem]"
        />
      </Link>
    </>
  );
}
