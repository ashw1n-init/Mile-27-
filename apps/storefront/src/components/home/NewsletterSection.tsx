"use client";

import { ArrowUpRight } from "lucide-react";
import { type FormEvent, useState } from "react";

export function NewsletterSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      className="min-w-0 max-w-full bg-transparent p-0 text-zinc-950"
      aria-labelledby="newsletter-title"
    >
      <div className="relative isolate min-w-0 max-w-full overflow-hidden rounded-none bg-[#d4030a] px-5 py-12 shadow-none sm:px-8 sm:py-16 lg:px-12 lg:py-24">
        <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-20">
          <div className="min-w-0">
            <p className="mb-10 max-w-[27ch] text-sm leading-relaxed text-black/65">
              New drops, road-ready edits, and the stories behind the gear.
            </p>
            <h2
              id="newsletter-title"
              className="max-w-[8ch] text-balance text-[clamp(3.25rem,15vw,4.5rem)] font-semibold leading-[0.84] tracking-[-0.075em] sm:text-[clamp(4rem,9.4vw,11rem)] sm:leading-[0.8]"
            >
              Join our newsletter.
            </h2>
          </div>

          <div className="min-w-0 lg:pb-2">
            {submitted ? (
              <p
                className="text-[clamp(2.2rem,4vw,4.8rem)] font-medium leading-[0.9] tracking-[-0.06em]"
                aria-live="polite"
              >
                You&apos;re on the list.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="group/form min-w-0">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="relative flex min-w-0 max-w-full items-end border-b-2 border-black/35 transition-colors duration-500 group-focus-within/form:border-black">
                  <span className="mb-5 hidden shrink-0 font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-black/45 sm:block">
                    01 / Inbox
                  </span>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@email.com"
                    className="newsletter-email-input w-0 min-w-0 flex-1 bg-transparent px-0 py-4 text-[clamp(1.35rem,5.5vw,2.75rem)] font-medium tracking-[-0.05em] text-black outline-none placeholder:text-black/38 sm:ml-6 sm:py-5"
                  />
                  <button
                    type="submit"
                    className="group/button mb-2 ml-4 flex size-12 shrink-0 items-center justify-center bg-black text-[#d4030a] transition-[background-color,color,transform] duration-300 hover:-translate-y-1 hover:bg-white hover:text-black active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:mb-3 sm:size-16"
                    aria-label="Join our newsletter"
                  >
                    <ArrowUpRight className="size-5 transition-transform duration-300 group-hover/button:-translate-y-1 group-hover/button:translate-x-1 sm:size-6" />
                  </button>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-black transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-focus-within/form:scale-x-100"
                  />
                </div>
                <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-black/60">
                  Occasional mail. Only the good routes.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
