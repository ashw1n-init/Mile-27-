import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface MastheadLink {
  label: string;
  href?: string;
}

interface MastheadIndexItem {
  id: string;
  name: string;
  href: string;
}

interface DiscoveryMastheadProps {
  title: string;
  description?: string | null;
  eyebrow: string;
  breadcrumbs: MastheadLink[];
  imageUrl?: string | null;
  indexItems?: MastheadIndexItem[];
  indexLabel?: string;
}

export function DiscoveryMasthead({
  title,
  description,
  eyebrow,
  breadcrumbs,
  imageUrl,
  indexItems = [],
  indexLabel = "Explore index",
}: DiscoveryMastheadProps) {
  return (
    <header className="border-b border-[#aaa9a4] bg-white text-[#0b0b0a]">
      <div className="mx-auto max-w-[1920px] border-x border-[#d8d8d2]">
        <div
          className={`grid min-h-[18rem] ${imageUrl ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(22rem,0.5fr)]" : ""}`}
        >
          <div className="flex min-w-0 flex-col justify-between px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9 2xl:px-14">
            <div className="flex items-start justify-between gap-6">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#66645f]">
                  {breadcrumbs.map((item, index) => (
                    <li
                      key={`${item.label}-${index}`}
                      className="flex items-center gap-2"
                    >
                      {index > 0 && <span aria-hidden="true">/</span>}
                      {item.href ? (
                        <Link
                          className="transition-colors hover:text-[#0b0b0a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b0b0a]"
                          href={item.href}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span aria-current="page">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[#66645f] sm:block">
                M27 / Discovery
              </span>
            </div>

            <div className="mt-16 grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(14rem,24rem)] lg:mt-20">
              <div className="min-w-0">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#ff4d20]">
                  {eyebrow}
                </p>
                <h1 className="max-w-[14ch] text-[clamp(3.5rem,9vw,9rem)] font-semibold leading-[0.8] tracking-[-0.075em] text-[#0b0b0a] [text-wrap:balance]">
                  {title}
                </h1>
              </div>
              {description && (
                <p className="max-w-[34rem] border-l border-[#d8d8d2] pl-4 text-sm leading-relaxed text-[#66645f] md:justify-self-end md:text-base">
                  {description}
                </p>
              )}
            </div>
          </div>

          {imageUrl && (
            <div className="relative min-h-64 overflow-hidden border-t border-[#d8d8d2] bg-[#f0f0ec] lg:min-h-full lg:border-l lg:border-t-0">
              {/* biome-ignore lint/performance/noImgElement: remote category images do not expose stable dimensions */}
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 size-full object-cover grayscale transition-[filter,transform] duration-700 hover:scale-[1.025] hover:grayscale-0 motion-reduce:transition-none"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-white/90 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] backdrop-blur-sm">
                <span>Category plate</span>
                <span>27</span>
              </div>
            </div>
          )}
        </div>

        {indexItems.length > 0 && (
          <section
            aria-labelledby="masthead-index-title"
            className="border-t border-[#aaa9a4]"
          >
            <div className="flex items-center justify-between border-b border-[#d8d8d2] px-4 py-3 sm:px-6 lg:px-10 2xl:px-14">
              <h2
                id="masthead-index-title"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#66645f]"
              >
                {indexLabel}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#66645f]">
                {String(indexItems.length).padStart(2, "0")} entries
              </span>
            </div>
            <nav
              aria-label={indexLabel}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5"
            >
              {indexItems.map((item, index) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group relative flex min-h-14 items-center gap-3 overflow-hidden border-b border-r border-[#d8d8d2] px-4 transition-colors duration-300 hover:bg-[#0b0b0a] hover:text-white focus-visible:z-10 focus-visible:bg-[#0b0b0a] focus-visible:text-white focus-visible:outline-2 focus-visible:outline-[#ff4d20]"
                >
                  <span className="w-6 shrink-0 font-mono text-[9px] tracking-[0.12em] text-[#77756f] transition-colors group-hover:text-white/45 group-focus-visible:text-white/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-[-0.02em] transition-transform duration-300 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5">
                    {item.name}
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 -translate-x-2 translate-y-2 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                    strokeWidth={1.5}
                  />
                </Link>
              ))}
            </nav>
          </section>
        )}
      </div>
    </header>
  );
}
