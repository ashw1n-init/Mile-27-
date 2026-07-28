"use client";

import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  LifeBuoy,
  Printer,
  Search,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { POLICY_LINKS } from "@/lib/constants/policies";

interface PolicyExperienceProps {
  basePath: string;
  body?: string | null;
  bodyHtml?: string | null;
  name: string;
  slug: string;
  updatedAt?: string | null;
}

interface SectionLink {
  id: string;
  label: string;
}

const FALLBACK_LABELS: Record<string, string[]> = {
  "shipping-policy": ["Processing", "Delivery", "Tracking", "Support"],
  "privacy-policy": ["Information", "Use of data", "Your choices", "Contact"],
  "returns-policy": ["Eligibility", "Return process", "Refunds", "Support"],
  "terms-of-service": ["Using the site", "Orders", "Payments", "Contact"],
};

function formatDate(value?: string | null): string {
  if (!value) return "Current published version";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Current published version";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function makeId(value: string, index: number): string {
  const id = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return id || `section-${index + 1}`;
}

export function PolicyExperience({
  basePath,
  body,
  bodyHtml,
  name,
  slug,
  updatedAt,
}: PolicyExperienceProps): React.JSX.Element {
  const articleRef = useRef<HTMLElement>(null);
  const [sections, setSections] = useState<SectionLink[]>([]);
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState("");
  const plainText = useMemo(
    () =>
      (bodyHtml || body || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " "),
    [body, bodyHtml],
  );
  const readingMinutes = Math.max(
    1,
    Math.ceil(plainText.trim().split(" ").length / 220),
  );

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h2, h3"),
    );
    const links = headings.map((heading, index) => {
      const id = heading.id || makeId(heading.textContent || "", index);
      heading.id = id;
      heading.classList.add("scroll-mt-32");
      return {
        id,
        label: heading.textContent?.trim() || `Section ${index + 1}`,
      };
    });
    setSections(links);
    setActiveId(links[0]?.id || "");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-18% 0px -68%", threshold: 0 },
    );
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const article = articleRef.current;
      if (!article) return;
      const start = article.offsetTop;
      const distance = Math.max(
        article.offsetHeight - window.innerHeight * 0.45,
        1,
      );
      setProgress(
        Math.min(100, Math.max(0, ((window.scrollY - start) / distance) * 100)),
      );
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const visibleSections = sections.length
    ? sections
    : (FALLBACK_LABELS[slug] || []).map((label, index) => ({
        id: `section-${index + 1}`,
        label,
      }));

  const copySection = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(""), 1800);
    } catch {
      window.location.hash = id;
    }
  };

  const searchDocument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get("policy-search") || "")
      .trim()
      .toLowerCase();
    if (!query || !articleRef.current) return;
    const match = Array.from(
      articleRef.current.querySelectorAll<HTMLElement>("h2, h3, p, li"),
    ).find((node) => node.textContent?.toLowerCase().includes(query));
    match?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="relative bg-[#f7f6f2] text-[#11110f] print:bg-white">
      <div className="fixed inset-x-0 top-0 z-[70] h-0.5 bg-black/10 print:hidden">
        <div
          className="h-full bg-[#e30613]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="mx-auto max-w-[1500px] px-5 pb-14 pt-16 sm:px-8 lg:px-12 lg:pb-20 lg:pt-24">
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/45">
          <span>Legal document</span>
          <span className="h-px w-9 bg-[#e30613]" />
          <span>India</span>
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h1 className="max-w-5xl text-[clamp(3.8rem,9.5vw,9.5rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-medium shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:bg-black hover:text-white"
            >
              <Printer className="size-4" aria-hidden="true" /> Print / save
            </button>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-black/10 pt-5 text-xs text-black/55">
          <span>Last updated: {formatDate(updatedAt)}</span>
          <span>{readingMinutes} min read</span>
          <span>Current published version</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 pb-28 sm:px-8 lg:grid-cols-[230px_minmax(0,760px)_260px] lg:px-12 xl:gap-20">
        <aside className="print:hidden lg:sticky lg:top-28 lg:h-fit">
          <form onSubmit={searchDocument} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/40" />
            <input
              name="policy-search"
              type="search"
              placeholder="Search this policy"
              className="h-12 w-full rounded-full bg-white pl-11 pr-4 text-sm outline-none ring-[#e30613] transition placeholder:text-black/35 focus:ring-1"
            />
          </form>
          {visibleSections.length > 0 && (
            <nav aria-label="Policy contents" className="mt-8">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                On this page
              </p>
              <ol className="space-y-1">
                {visibleSections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`flex items-baseline gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        activeId === section.id
                          ? "bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                          : "text-black/45 hover:text-black"
                      }`}
                    >
                      <span className="text-[10px] tabular-nums text-[#e30613]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </aside>

        <article ref={articleRef} className="policy-document min-w-0">
          <div className="mb-12 rounded-[2rem] bg-[#11110f] p-7 text-white sm:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
              The short version
            </p>
            <p className="mt-4 max-w-2xl text-xl leading-relaxed tracking-[-0.02em] text-white/90 sm:text-2xl">
              This document explains the rules, responsibilities and choices
              connected to {name.toLowerCase()}. The full wording below is the
              governing version.
            </p>
          </div>
          {bodyHtml ? (
            <div
              className="prose prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-[-0.035em] prose-h2:mt-20 prose-h2:text-4xl prose-h3:mt-12 prose-h3:text-2xl prose-p:text-[17px] prose-p:leading-8 prose-p:text-black/68 prose-li:text-[17px] prose-li:leading-8 prose-li:text-black/68 prose-a:text-black prose-a:decoration-[#e30613] prose-a:underline-offset-4 prose-strong:text-black"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-[17px] leading-8 text-black/68">
              {body}
            </div>
          )}

          {sections.length > 0 && (
            <div className="mt-16 space-y-2 border-t border-black/10 pt-7 print:hidden">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                Direct links
              </p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => copySection(section.id)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-white"
                >
                  <span>{section.label}</span>
                  {copiedId === section.id ? (
                    <Check className="size-4 text-[#e30613]" />
                  ) : (
                    <Copy className="size-4 text-black/35" />
                  )}
                </button>
              ))}
            </div>
          )}
        </article>

        <aside className="space-y-5 print:hidden lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-[1.75rem] bg-[#e7e3da] p-6">
            <FileText className="size-5" aria-hidden="true" />
            <h2 className="mt-8 text-lg font-semibold tracking-[-0.02em]">
              Plain-language guide
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Headings and summaries help you navigate. If a summary conflicts
              with the full policy text, the full text applies.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-white p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
              Related documents
            </p>
            <div className="mt-5 space-y-1">
              {POLICY_LINKS.filter((policy) => policy.slug !== slug).map(
                (policy) => (
                  <Link
                    key={policy.slug}
                    href={`${basePath}/policies/${policy.slug}`}
                    className="flex items-center justify-between rounded-xl px-2 py-3 text-sm transition hover:bg-[#f7f6f2]"
                  >
                    {policy.name}
                    <ArrowUpRight
                      className="size-4 text-black/35"
                      aria-hidden="true"
                    />
                  </Link>
                ),
              )}
            </div>
          </div>

          <Link
            href={`${basePath}/account/orders`}
            className="group block rounded-[1.75rem] bg-[#e30613] p-6 text-white"
          >
            <LifeBuoy className="size-5" aria-hidden="true" />
            <p className="mt-8 text-lg font-semibold tracking-[-0.02em]">
              Need help with an order?
            </p>
            <p className="mt-2 text-sm text-white/70">
              Open your orders to find the right purchase and support details.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
              View orders
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        </aside>
      </div>
    </main>
  );
}
