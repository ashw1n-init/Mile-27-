"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Announcement } from "@/lib/announcements";

interface AnnouncementBandProps {
  announcements: Announcement[];
  basePath: string;
}

function resolveActionUrl(url: string, basePath: string): string {
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith(basePath)) return url;
  return `${basePath}${url.startsWith("/") ? url : `/${url}`}`;
}

export function AnnouncementBand({
  announcements,
  basePath,
}: AnnouncementBandProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pathname = usePathname();
  const active = announcements[activeIndex];

  useEffect(() => {
    if (announcements.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % announcements.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [announcements.length, paused]);

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const normalizedHomepage = basePath.replace(/\/+$/, "") || "/";

  if (!active || normalizedPathname !== normalizedHomepage) return null;

  const theme =
    active.themeMode ||
    (active.type === "urgent"
      ? "signal"
      : active.type === "campaign"
        ? "dark"
        : "light");

  return (
    <aside
      aria-label="Store announcement"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`relative z-40 border-b ${
        theme === "dark"
          ? "border-[#1e1112] bg-[#1e1112] text-white"
          : theme === "signal"
            ? "border-[#d4030a] bg-[#d4030a] text-[#1e1112]"
            : "border-[#9faaae] bg-[#ffffff] text-[#1e1112]"
      }`}
    >
      <div
        key={active.id}
        className="mx-auto grid min-h-[4.5rem] max-w-[1920px] animate-[announcement-enter_500ms_cubic-bezier(0.16,1,0.3,1)] grid-cols-[4.25rem_minmax(0,1fr)_3rem] items-stretch px-4 sm:grid-cols-[8.5rem_minmax(0,1fr)_10rem] sm:px-8 lg:min-h-16 lg:grid-cols-[12rem_minmax(0,1fr)_16rem] lg:px-10"
      >
        <div className="flex items-center gap-2 border-r border-current/20 pr-3 sm:gap-4">
          <span className="font-sans text-[10px] tabular-nums opacity-55">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <p className="hidden font-sans text-[9px] uppercase tracking-[0.18em] opacity-70 sm:block">
            {active.label}
          </p>
        </div>
        <div className="relative flex min-w-0 items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]">
          <div
            className={`flex w-max min-w-full items-center ${
              paused
                ? "[animation-play-state:paused]"
                : "animate-[announcement-marquee_22s_linear_infinite]"
            } motion-reduce:animate-none`}
          >
            {[0, 1].map((group) => (
              <p
                key={group}
                className="flex min-w-full shrink-0 items-center whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs"
                aria-hidden={group === 1 ? "true" : undefined}
              >
                {Array.from({ length: 3 }, (_, item) => (
                  <span key={item} className="flex shrink-0 items-center">
                    <span className="px-6 lg:px-10">{active.message}</span>
                    <span className="size-1 rotate-45 bg-current opacity-50" />
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
        {active.actionLabel && active.actionUrl ? (
          <Link
            href={resolveActionUrl(active.actionUrl, basePath)}
            className="group inline-flex min-h-11 items-center justify-end gap-2 border-l border-current/20 pl-3 text-[10px] font-semibold uppercase tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current sm:pl-5"
          >
            <span className="hidden sm:inline">{active.actionLabel}</span>
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <span className="border-l border-current/20" aria-hidden="true" />
        )}
      </div>
      {announcements.length > 1 ? (
        <div
          className="absolute inset-x-0 bottom-0 grid h-px"
          style={{
            gridTemplateColumns: `repeat(${announcements.length}, minmax(0, 1fr))`,
          }}
          aria-hidden="true"
        >
          {announcements.map((announcement, index) => (
            <span
              key={announcement.id}
              className={index === activeIndex ? "bg-current" : "bg-current/20"}
            />
          ))}
        </div>
      ) : null}
    </aside>
  );
}
