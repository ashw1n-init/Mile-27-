"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bike,
  Box,
  ChevronRight,
  CircleGauge,
  Headphones,
  Heart,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import Link from "next/link";

interface RiderHeadquartersProps {
  basePath: string;
  firstName?: string | null;
}

const ownershipTools = [
  {
    icon: Bike,
    title: "My garage",
    note: "Add a motorcycle",
    action: "Build garage",
  },
  {
    icon: ShieldCheck,
    title: "Warranty centre",
    note: "Your cover, in one place",
    action: "View cover",
  },
  {
    icon: Wrench,
    title: "Care schedule",
    note: "No reminders set",
    action: "Set reminders",
  },
];

export function RiderHeadquarters({
  basePath,
  firstName,
}: RiderHeadquartersProps) {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="rider-hq">
      <motion.header
        {...enter}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="rider-hq__hero"
      >
        <div>
          <p className="rider-hq__eyebrow">Rider headquarters · Mile 27</p>
          <h1 className="font-cal-sans">
            Good to see you{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="rider-hq__lede">
            Your orders, equipment and ownership essentials—quietly organised
            for the road ahead.
          </p>
        </div>
        <Link className="rider-hq__signal" href={`${basePath}/account/profile`}>
          <span>Personalisation</span>
          <strong>Start</strong>
          <i aria-hidden="true">
            <b />
          </i>
        </Link>
      </motion.header>

      <motion.section
        {...enter}
        transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="rider-hq__priority"
        aria-labelledby="next-up-title"
      >
        <div className="rider-hq__priority-copy">
          <p className="rider-hq__eyebrow">Next up</p>
          <h2 id="next-up-title">Everything is clear.</h2>
          <p>
            There are no active deliveries or support requests. Your ride is
            ready when you are.
          </p>
          <Link href={`${basePath}/products`}>
            Explore equipment <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div className="rider-hq__orbit" aria-hidden="true">
          <span>
            <PackageCheck />
          </span>
          <i />
          <i />
          <i />
        </div>
      </motion.section>

      <section className="rider-hq__quick" aria-label="Account summary">
        <Link href={`${basePath}/account/orders`}>
          <Box />
          <span>
            <b>Orders</b>
            <small>History & tracking</small>
          </span>
          <ChevronRight />
        </Link>
        <Link href={`${basePath}/account/addresses`}>
          <MapPin />
          <span>
            <b>Addresses</b>
            <small>Delivery locations</small>
          </span>
          <ChevronRight />
        </Link>
        <Link href={`${basePath}/account/gift-cards`}>
          <CircleGauge />
          <span>
            <b>Credits</b>
            <small>Gift cards & balance</small>
          </span>
          <ChevronRight />
        </Link>
        <Link href={`${basePath}/account/profile`}>
          <Sparkles />
          <span>
            <b>Preferences</b>
            <small>Fit, brands & riding</small>
          </span>
          <ChevronRight />
        </Link>
      </section>

      <section className="rider-hq__section" aria-labelledby="ownership-title">
        <div className="rider-hq__section-head">
          <div>
            <p className="rider-hq__eyebrow">Ownership system</p>
            <h2 id="ownership-title">Built around what you ride.</h2>
          </div>
          <span>Personalise over time</span>
        </div>
        <div className="rider-hq__tools">
          {ownershipTools.map(({ icon: Icon, title, note, action }, index) => (
            <motion.button
              whileHover={reduceMotion ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              type="button"
              key={title}
            >
              <span className="rider-hq__tool-index">0{index + 1}</span>
              <Icon aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{note}</p>
              </div>
              <span className="rider-hq__tool-action">
                {action} <ArrowUpRight />
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="rider-hq__lower">
        <div>
          <p className="rider-hq__eyebrow">Saved for later</p>
          <Heart />
          <h2>Keep the shortlist close.</h2>
          <p>Products you save will live here, ready for the next ride.</p>
          <Link href={`${basePath}/products`}>Discover equipment</Link>
        </div>
        <div>
          <p className="rider-hq__eyebrow">Contextual support</p>
          <Headphones />
          <h2>Help that already knows the context.</h2>
          <p>
            Start from an order or warranty and we’ll carry the details into
            your request.
          </p>
          <Link href={`${basePath}/account/orders`}>Start with an order</Link>
        </div>
      </section>
    </div>
  );
}
