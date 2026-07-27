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
      className="bg-white px-5 pb-5 text-zinc-950 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10"
      aria-labelledby="newsletter-title"
    >
      <div className="relative isolate overflow-hidden bg-[#d4030a] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
        <div className="relative grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
          <div>
            <p className="mb-10 max-w-[27ch] text-sm leading-relaxed text-black/65">
              New drops, road-ready edits, and the stories behind the gear.
            </p>
            <h2
              id="newsletter-title"
              className="max-w-[8ch] text-balance text-[clamp(4rem,9.4vw,11rem)] font-semibold leading-[0.8] tracking-[-0.085em]"
            >
              Join our newsletter.
            </h2>
          </div>

          <div className="lg:pb-2">
            {submitted ? (
              <p
                className="text-[clamp(2.2rem,4vw,4.8rem)] font-medium leading-[0.9] tracking-[-0.06em]"
                aria-live="polite"
              >
                You&apos;re on the list.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="group/form">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="flex border-b-2 border-black transition-colors duration-300 group-focus-within/form:border-white">
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Your email address"
                    className="min-w-0 flex-1 bg-transparent py-4 text-[clamp(1.2rem,2vw,2rem)] font-medium tracking-[-0.045em] outline-none placeholder:text-black/45"
                  />
                  <button
                    type="submit"
                    className="group/button flex size-16 shrink-0 items-center justify-center bg-black text-[#d4030a] transition-transform duration-300 hover:scale-[1.05] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                    aria-label="Join our newsletter"
                  >
                    <ArrowUpRight className="size-6 transition-transform duration-300 group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5" />
                  </button>
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
