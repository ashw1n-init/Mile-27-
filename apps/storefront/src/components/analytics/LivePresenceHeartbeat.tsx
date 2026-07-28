"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HEARTBEAT_INTERVAL = 20_000;
const SESSION_KEY = "mile27_live_presence_id";

function deviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

function sessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const created = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

interface LivePresenceHeartbeatProps {
  country: string;
  locale: string;
  publishableKey: string;
}

export function LivePresenceHeartbeat({
  country,
  locale,
  publishableKey,
}: LivePresenceHeartbeatProps) {
  const pathname = usePathname();

  useEffect(() => {
    const privacyNavigator = navigator as Navigator & {
      globalPrivacyControl?: boolean;
    };
    if (navigator.doNotTrack === "1" || privacyNavigator.globalPrivacyControl) {
      return;
    }

    const endpoint = `${process.env.NEXT_PUBLIC_SPREE_API_URL}/api/v3/store/live_presence`;
    const send = () => {
      if (document.visibilityState !== "visible") return;

      void fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-spree-api-key": publishableKey,
        },
        body: JSON.stringify({
          session_id: sessionId(),
          country,
          locale,
          path: pathname,
          device: deviceType(),
        }),
        keepalive: true,
        credentials: "omit",
      }).catch(() => undefined);
    };

    send();
    const interval = window.setInterval(send, HEARTBEAT_INTERVAL);
    document.addEventListener("visibilitychange", send);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", send);
    };
  }, [country, locale, pathname, publishableKey]);

  return null;
}
