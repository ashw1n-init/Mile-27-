export type AnnouncementMode = "campaign" | "utility" | "urgent" | "editorial";

export interface Announcement {
  id: string;
  type: AnnouncementMode;
  label: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: number;
  activeFrom?: string;
  activeUntil?: string;
  audience?: "all" | "retail" | "wholesale";
  locale?: string;
  enabled: boolean;
  themeMode?: "light" | "dark" | "signal";
}

function validDate(value?: string): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function getActiveAnnouncements({
  locale,
  audience = "retail",
  now = Date.now(),
}: {
  locale: string;
  audience?: "retail" | "wholesale";
  now?: number;
}): Announcement[] {
  const source = process.env.HEADER_ANNOUNCEMENTS;
  if (!source) return [];

  try {
    const parsed = JSON.parse(source);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Announcement => {
        if (
          !item ||
          typeof item.id !== "string" ||
          typeof item.label !== "string" ||
          typeof item.message !== "string" ||
          !["campaign", "utility", "urgent", "editorial"].includes(item.type)
        ) {
          return false;
        }
        const startsAt = validDate(item.activeFrom);
        const endsAt = validDate(item.activeUntil);
        return (
          item.enabled === true &&
          (!item.locale || item.locale === locale) &&
          (!item.audience ||
            item.audience === "all" ||
            item.audience === audience) &&
          (!startsAt || startsAt <= now) &&
          (!endsAt || endsAt >= now)
        );
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  } catch {
    return [];
  }
}
