"use client";

import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  Play,
  Star,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { RiderVoice, RiderVoicesResponse } from "@/lib/data/rider-voices";

interface RiderVoicesSectionProps {
  productId: string;
  productSlug: string;
  productName: string;
  basePath: string;
  initialData: RiderVoicesResponse;
}

type View = "reviews" | "media" | "questions" | "discussions";
type ContributionMode = "review" | "question";

function Rating({
  value,
  size = "small",
}: {
  value: number;
  size?: "small" | "large";
}) {
  return (
    <span
      role="img"
      className="inline-flex gap-1"
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={size === "large" ? "size-5" : "size-3.5"}
          fill={index < value ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function ReviewMedia({ voice }: { voice: RiderVoice }) {
  const media = voice.media[0];
  if (!media) return null;

  if (media.type === "image") {
    return (
      // biome-ignore lint/performance/noImgElement: API review media can be remote and user-generated.
      <img
        src={media.url}
        alt={
          media.alt_text || media.caption || `Media from ${voice.display_name}`
        }
        loading="lazy"
        className="h-full min-h-72 w-full object-cover"
      />
    );
  }

  if (media.type === "video") {
    return (
      <div>
        {/* biome-ignore lint/a11y/useMediaCaption: moderation publishes the accessible transcript directly below when supplied; timed VTT is not yet part of the API. */}
        <video
          controls
          preload="none"
          aria-label={
            media.caption || `Video review from ${voice.display_name}`
          }
          className="h-full min-h-72 w-full bg-[#ffffff] object-contain"
        >
          <source src={media.url} />
        </video>
        {media.transcript && (
          <details className="border-x border-b border-[#9faaae] p-4 text-sm">
            <summary className="cursor-pointer font-medium">Transcript</summary>
            <p className="mt-3 leading-relaxed text-[#5c656a]">
              {media.transcript}
            </p>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-48 flex-col justify-end bg-[#ffffff] p-7">
      <Mic className="mb-8 size-7" aria-hidden="true" />
      {/* biome-ignore lint/a11y/useMediaCaption: audio uses a visible transcript because HTML audio does not support caption tracks consistently. */}
      <audio controls preload="none" className="w-full">
        <source src={media.url} />
      </audio>
      {media.transcript && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium">Transcript</summary>
          <p className="mt-3 leading-relaxed text-[#5c656a]">
            {media.transcript}
          </p>
        </details>
      )}
    </div>
  );
}

function ContributionForm({
  productId,
  mode,
  onClose,
}: {
  productId: string;
  mode: ContributionMode;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const isReview = mode === "review";
  const totalSteps = isReview ? 3 : 2;

  async function submit() {
    setStatus("sending");
    setMessage("");
    const form = new FormData();
    form.set("contribution_type", isReview ? "review" : "question");
    form.set("title", title);
    form.set("body", body);
    form.set("display_name", displayName || "Rider");
    form.set("locale", "en");
    if (isReview) form.set("rating", String(rating));
    Array.from(files || [])
      .slice(0, 6)
      .forEach((file) => {
        form.append("media[]", file);
      });

    const response = await fetch(`/api/rider-voices/${productId}`, {
      method: "POST",
      body: form,
    });
    const payload = await response.json();
    if (response.ok) {
      setStatus("sent");
      setMessage(payload.meta?.message || "Submitted for review");
    } else {
      setStatus("error");
      setMessage(
        payload.error?.message ||
          Object.values(payload.errors || {})
            .flat()
            .join(" ") ||
          "We could not submit this contribution.",
      );
    }
  }

  if (status === "sent") {
    return (
      <div className="border-t border-[#9faaae] py-10">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#d4030a]">
          Submission received
        </p>
        <p className="mt-5 max-w-xl text-3xl font-medium tracking-tight">
          {message}. We will show it here after moderation.
        </p>
        <button type="button" onClick={onClose} className="mt-8 underline">
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      className="border-t border-[#9faaae] py-10"
      onSubmit={(event) => {
        event.preventDefault();
        if (step < totalSteps) setStep((current) => current + 1);
        else void submit();
      }}
    >
      <div className="flex items-center justify-between">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#5c656a]">
          {isReview ? "Share your ride" : "Ask the riders"} · {step}/
          {totalSteps}
        </p>
        <button type="button" onClick={onClose} className="text-sm underline">
          Cancel
        </button>
      </div>

      {step === 1 && isReview && (
        <fieldset className="mt-8">
          <legend className="text-3xl font-medium tracking-tight">
            How did this product perform?
          </legend>
          <div className="mt-6 flex gap-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} stars`}
                aria-pressed={rating === value}
                className="flex size-14 items-center justify-center border border-[#9faaae] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4030a]"
              >
                <Star
                  className="size-6"
                  fill={value <= rating ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {((isReview && step === 2) || (!isReview && step === 1)) && (
        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {isReview ? "Review title" : "Your question"}
            </span>
            <input
              required
              maxLength={180}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-14 border border-[#9faaae] bg-white px-4 outline-none focus:border-[#1e1112]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">
              {isReview
                ? "Tell us what happened on the road"
                : "Add useful context"}
            </span>
            <textarea
              required
              minLength={12}
              maxLength={10_000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              className="border border-[#9faaae] bg-white p-4 outline-none focus:border-[#1e1112]"
            />
          </label>
        </div>
      )}

      {((isReview && step === 3) || (!isReview && step === 2)) && (
        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Public display name</span>
            <input
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="h-14 border border-[#9faaae] bg-white px-4 outline-none focus:border-[#1e1112]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">
              Add images, video, or audio (optional)
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/wav,audio/webm"
              onChange={(event) => setFiles(event.target.files)}
              className="min-h-14 border border-[#9faaae] bg-white p-3 file:mr-4 file:border-0 file:bg-[#1e1112] file:px-4 file:py-2 file:text-white"
            />
          </label>
        </div>
      )}

      {status === "error" && (
        <p role="alert" className="mt-5 text-sm text-red-700">
          {message}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="h-14 border border-[#1e1112] px-6"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={
            (isReview && step === 1 && rating === 0) || status === "sending"
          }
          className="flex h-14 min-w-44 items-center justify-between gap-8 bg-[#d4030a] px-6 font-semibold disabled:bg-[#9faaae]"
        >
          {step === totalSteps
            ? status === "sending"
              ? "Submitting"
              : "Submit"
            : "Continue"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

export function RiderVoicesSection({
  productId,
  productSlug,
  productName,
  basePath,
  initialData,
}: RiderVoicesSectionProps) {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>("reviews");
  const [formMode, setFormMode] = useState<ContributionMode | null>(null);
  const summary = initialData.meta.summary;
  const visibleVoices = useMemo(() => {
    if (view === "questions") {
      return initialData.data.filter((voice) => voice.type === "question");
    }
    if (view === "media") {
      return initialData.data.filter((voice) => voice.media.length > 0);
    }
    return initialData.data;
  }, [initialData.data, view]);
  const featured =
    visibleVoices.find((voice) => voice.featured) || visibleVoices[0];

  const tabs: Array<{ id: View; label: string; count: number }> = [
    { id: "reviews", label: "Reviews", count: summary.review_count },
    { id: "media", label: "Media", count: summary.media_count },
    { id: "questions", label: "Questions", count: summary.question_count },
    {
      id: "discussions",
      label: "Discussions",
      count: initialData.data.reduce(
        (total, voice) => total + voice.replies_count,
        0,
      ),
    },
  ];

  return (
    <section
      id="rider-voices"
      aria-labelledby="rider-voices-title"
      className="border-t border-[#9faaae] bg-white text-[#1e1112]"
    >
      <header className="mx-auto max-w-[1920px] px-4 pb-16 pt-24 sm:px-8 lg:px-10 lg:pb-24 lg:pt-36">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#d4030a]">
          Rider voices
        </p>
        <div className="mt-8 max-w-5xl">
          <h2
            id="rider-voices-title"
            className="text-[clamp(3.5rem,8vw,9rem)] font-semibold leading-[0.82] tracking-[-0.075em]"
          >
            Real roads.
            <br />
            Real verdicts.
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#5c656a]">
            Reviews, rider stories, and product questions from people who use
            {` ${productName}`} where it matters.
          </p>
        </div>
      </header>

      <nav
        aria-label="Rider voices"
        className="sticky top-[4.5rem] z-20 overflow-x-auto border-y border-[#9faaae] bg-white/95 px-4 backdrop-blur sm:px-8 lg:px-10"
      >
        <div className="mx-auto flex min-w-max max-w-[1920px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              aria-current={view === tab.id ? "page" : undefined}
              className={`h-16 border-r border-[#9faaae] px-5 text-sm first:border-l ${
                view === tab.id ? "bg-[#1e1112] text-white" : "bg-white"
              }`}
            >
              {tab.label}{" "}
              <span className="ml-2 font-sans text-[10px]">{tab.count}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-[1920px]">
        <div className="grid border-b border-[#9faaae] lg:grid-cols-12">
          <aside className="border-b border-[#9faaae] p-6 sm:p-10 lg:col-span-4 lg:border-b-0 lg:border-r">
            {summary.review_count > 0 ? (
              <>
                <div className="flex items-end gap-4">
                  <strong className="text-8xl font-medium leading-none tracking-[-0.08em]">
                    {summary.average_rating?.toFixed(1)}
                  </strong>
                  <span className="pb-2 text-sm text-[#5c656a]">out of 5</span>
                </div>
                <div className="mt-6">
                  <Rating
                    value={Math.round(summary.average_rating || 0)}
                    size="large"
                  />
                </div>
                <p className="mt-5 text-sm text-[#5c656a]">
                  {summary.review_count} published reviews ·{" "}
                  {summary.verified_percentage}% verified buyers
                </p>
                <dl className="mt-10 space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count =
                      summary.rating_distribution[String(rating)] || 0;
                    const width = summary.review_count
                      ? `${(count / summary.review_count) * 100}%`
                      : "0%";
                    return (
                      <div
                        key={rating}
                        className="grid grid-cols-[2rem_1fr_2rem] items-center gap-3 text-xs"
                      >
                        <dt>{rating}</dt>
                        <dd className="h-px bg-[#9faaae]">
                          <span
                            className="block h-px bg-[#1e1112]"
                            style={{ width }}
                          />
                        </dd>
                        <dd className="text-right text-[#5c656a]">{count}</dd>
                      </div>
                    );
                  })}
                </dl>
              </>
            ) : (
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#5c656a]">
                  Review intelligence
                </p>
                <p className="mt-8 max-w-sm text-3xl font-medium leading-tight tracking-tight">
                  No rider verdicts have been published yet.
                </p>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#5c656a]">
                  Be the first to document fit, comfort, noise, quality, and
                  real-world performance.
                </p>
              </div>
            )}

            <div className="mt-12 grid gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => setFormMode("review")}
                    className="flex h-14 items-center justify-between bg-[#d4030a] px-5 font-semibold"
                  >
                    Write a review{" "}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode("question")}
                    className="flex h-14 items-center justify-between border border-[#1e1112] px-5 font-semibold"
                  >
                    Ask a question{" "}
                    <MessageCircle className="size-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <Link
                  href={`${basePath}/account?redirect=${encodeURIComponent(`${basePath}/products/${productSlug}#rider-voices`)}`}
                  className="flex h-14 items-center justify-between bg-[#1e1112] px-5 font-semibold text-white"
                >
                  Sign in to contribute{" "}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </aside>

          <div className="p-6 sm:p-10 lg:col-span-8 lg:p-14">
            {formMode && (
              <ContributionForm
                productId={productId}
                mode={formMode}
                onClose={() => setFormMode(null)}
              />
            )}

            {!featured ? (
              <div className="flex min-h-[24rem] flex-col justify-between sm:min-h-[34rem]">
                <span
                  className="text-[10rem] font-serif leading-[0.65] text-[#9faaae]"
                  aria-hidden="true"
                >
                  “
                </span>
                <div>
                  <h3 className="max-w-3xl text-[clamp(2.4rem,5vw,5.8rem)] font-medium leading-[0.95] tracking-[-0.055em]">
                    The first useful voice should be yours.
                  </h3>
                  <p className="mt-8 max-w-xl text-[#5c656a]">
                    We do not seed reviews or manufacture social proof.
                    Published contributions will appear here after moderation.
                  </p>
                </div>
              </div>
            ) : (
              <article id={`rider-voice-${featured.id}`}>
                <div className="grid gap-10 xl:grid-cols-2">
                  <blockquote>
                    <span
                      className="text-[8rem] font-serif leading-[0.6] text-[#d4030a]"
                      aria-hidden="true"
                    >
                      “
                    </span>
                    <p className="mt-8 text-[clamp(2.2rem,4vw,4.8rem)] font-medium leading-[0.95] tracking-[-0.05em]">
                      {featured.quote}
                    </p>
                  </blockquote>
                  <ReviewMedia voice={featured} />
                </div>

                <div className="mt-12 grid gap-8 border-t border-[#9faaae] pt-8 sm:grid-cols-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <strong>{featured.display_name}</strong>
                      {featured.verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold">
                          <BadgeCheck
                            className="size-4 text-[#d4030a]"
                            aria-hidden="true"
                          />
                          Verified buyer
                        </span>
                      )}
                    </div>
                    {featured.rating && (
                      <div className="mt-3">
                        <Rating value={featured.rating} />
                      </div>
                    )}
                    <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.14em] text-[#5c656a]">
                      {[
                        featured.variant?.name,
                        featured.rider_type,
                        featured.usage_type,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div>
                    <p className="leading-relaxed text-[#5c656a]">
                      {featured.body}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-5 text-sm">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                      >
                        <ThumbsUp className="size-4" aria-hidden="true" />
                        Helpful {featured.helpful_count}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                      >
                        <MessageCircle className="size-4" aria-hidden="true" />
                        {featured.replies_count} replies
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>

        {visibleVoices.length > 1 && (
          <div className="px-4 py-20 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between border-b border-[#1e1112] pb-5">
              <h3 className="text-2xl font-medium">More rider voices</h3>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm"
              >
                Most helpful{" "}
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-x-12 md:grid-cols-2">
              {visibleVoices.slice(1).map((voice, index) => (
                <article
                  key={voice.id}
                  id={`rider-voice-${voice.id}`}
                  className="py-12 md:odd:border-r md:odd:pr-12 md:even:pl-0"
                >
                  <p className="font-sans text-[10px] text-[#5c656a]">
                    {String(index + 2).padStart(2, "0")} /{" "}
                    {voice.type.replace("_", " ")}
                  </p>
                  <blockquote className="mt-7 text-3xl font-medium leading-tight tracking-tight">
                    “{voice.quote}”
                  </blockquote>
                  <p className="mt-6 line-clamp-4 leading-relaxed text-[#5c656a]">
                    {voice.body}
                  </p>
                  <div className="mt-7 flex items-center justify-between border-t border-[#9faaae] pt-5 text-sm">
                    <span>{voice.display_name}</span>
                    <span className="inline-flex items-center gap-2">
                      {voice.media.some((item) => item.type === "image") && (
                        <ImageIcon className="size-4" />
                      )}
                      {voice.media.some((item) => item.type === "video") && (
                        <Play className="size-4" />
                      )}
                      {voice.media.some((item) => item.type === "audio") && (
                        <Mic className="size-4" />
                      )}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
