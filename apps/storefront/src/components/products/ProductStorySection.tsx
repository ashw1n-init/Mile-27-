import { ProductImage } from "@/components/ui/product-image";
import type {
  ProductStory,
  ProductStoryModule,
} from "@/lib/data/product-story";

const compactTypes = new Set([
  "feature_grid",
  "key_benefit_strip",
  "included_in_box",
  "compatibility",
  "sizing_fit",
  "buyer_note",
  "trust_warranty",
  "comparison",
]);

function visibilityClass(module: ProductStoryModule) {
  if (module.visibility === "desktop_only") return "hidden md:block";
  if (module.visibility === "mobile_only") return "md:hidden";
  return "block";
}

function StoryMedia({
  module,
  fallbackUrl,
  priority = false,
}: {
  module: ProductStoryModule;
  fallbackUrl?: string;
  priority?: boolean;
}) {
  const media =
    module.media?.[0] ||
    (fallbackUrl ? { url: fallbackUrl, type: "image" as const } : undefined);
  if (!media?.url) return null;
  if (media.type === "video" && !media.transcript_url) return null;
  if (media.type === "video") {
    return (
      <video
        controls
        preload="none"
        poster={media.poster_url}
        className="aspect-video w-full bg-[#f0f0ec] object-contain"
      >
        <source src={media.url} />
        <track
          kind="captions"
          src={media.transcript_url}
          srcLang="en"
          label="English"
        />
        {media.caption}
      </video>
    );
  }
  return (
    <figure>
      <div className="relative aspect-[4/3] bg-[#f0f0ec]">
        <ProductImage
          src={media.url}
          alt={media.alt_text || "Product detail"}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 62vw"
          className="object-contain p-[4%]"
        />
      </div>
      {media.caption && (
        <figcaption className="mt-3 text-xs text-[#66645f]">
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}

function Module({
  module,
  index,
  fallbackUrl,
}: {
  module: ProductStoryModule;
  index: number;
  fallbackUrl?: string;
}) {
  const isCompact = compactTypes.has(module.module_type);
  const reverse =
    module.layout === "text_left" || module.layout === "media_right";
  return (
    <section
      className={`${visibilityClass(module)} border-t border-[#aaa9a4] px-4 py-20 sm:px-8 lg:py-32`}
      aria-labelledby={`story-module-${module.id}`}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#66645f]">
          <span>
            {String(index + 1).padStart(2, "0")} /{" "}
            {module.module_type.replaceAll("_", " ")}
          </span>
          {module.source_references?.length > 0 && <span>Source verified</span>}
        </div>
        <div
          className={
            isCompact ? "" : "grid gap-12 lg:grid-cols-12 lg:items-center"
          }
        >
          <div
            className={
              isCompact
                ? ""
                : reverse
                  ? "lg:col-span-5"
                  : "lg:order-2 lg:col-span-5 lg:col-start-8"
            }
          >
            {module.subheading && (
              <p className="text-xs uppercase tracking-[0.16em] text-[#ff4d20]">
                {module.subheading}
              </p>
            )}
            {module.heading && (
              <h3
                id={`story-module-${module.id}`}
                className="mt-5 max-w-[14ch] text-[clamp(2.5rem,5vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.055em]"
              >
                {module.heading}
              </h3>
            )}
            {module.body && (
              <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-[#66645f]">
                {module.body}
              </p>
            )}
          </div>
          {!isCompact && (
            <div
              className={
                reverse
                  ? "lg:order-2 lg:col-span-7"
                  : "lg:order-1 lg:col-span-7"
              }
            >
              <StoryMedia module={module} fallbackUrl={fallbackUrl} />
            </div>
          )}
        </div>
        {module.callouts?.length > 0 && (
          <dl
            className={`mt-14 grid border-t border-[#aaa9a4] ${module.callouts.length > 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
          >
            {module.callouts
              .slice(0, module.module_type === "feature_grid" ? 6 : undefined)
              .map((item, calloutIndex) => (
                <div
                  key={`${item.title}-${calloutIndex}`}
                  className="border-b border-[#d8d8d2] py-7 md:px-6 md:first:pl-0"
                >
                  {item.value && (
                    <dd className="text-3xl font-semibold tracking-tight">
                      {item.value}
                    </dd>
                  )}
                  <dt className="mt-2 font-medium">{item.title}</dt>
                  {item.body && (
                    <dd className="mt-2 max-w-[36ch] text-sm leading-relaxed text-[#66645f]">
                      {item.body}
                    </dd>
                  )}
                </div>
              ))}
          </dl>
        )}
        {isCompact && module.media?.length > 0 && (
          <div className="mt-12">
            <StoryMedia module={module} fallbackUrl={fallbackUrl} />
          </div>
        )}
      </div>
    </section>
  );
}

export function ProductStorySection({
  story,
  fallbackMedia = [],
}: {
  story: ProductStory;
  fallbackMedia?: string[];
}) {
  return (
    <section
      aria-labelledby="product-story-title"
      className="bg-white text-[#0b0b0a]"
    >
      <header className="px-4 py-28 sm:px-8 lg:py-44">
        <div className="mx-auto max-w-[1600px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff4d20]">
            {story.eyebrow || "Product, deconstructed"}
          </p>
          <h2
            id="product-story-title"
            className="mt-9 max-w-[12ch] text-[clamp(3.3rem,7.5vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.065em]"
          >
            {story.title}
          </h2>
          {story.introduction && (
            <p className="mt-16 max-w-[34ch] text-[clamp(1.65rem,3vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.04em] lg:ml-[24%]">
              {story.introduction}
            </p>
          )}
        </div>
      </header>
      {story.modules.map((module, index) => (
        <Module
          key={module.id}
          module={module}
          index={index}
          fallbackUrl={fallbackMedia[index % Math.max(fallbackMedia.length, 1)]}
        />
      ))}
    </section>
  );
}
