export type RiderVoiceType =
  | "review"
  | "rider_story"
  | "question"
  | "answer"
  | "reply";

export interface RiderVoiceMedia {
  id: string;
  type: "image" | "video" | "audio";
  url: string;
  caption: string | null;
  alt_text: string | null;
  transcript: string | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
}

export interface RiderVoice {
  id: string;
  type: RiderVoiceType;
  title: string | null;
  body: string;
  quote: string;
  rating: number | null;
  verified_purchase: boolean;
  featured: boolean;
  display_name: string;
  rider_type: string | null;
  usage_type: string | null;
  ownership_duration: string | null;
  variant: { id: string; name: string } | null;
  feedback: Record<string, string>;
  helpful_count: number;
  replies_count: number;
  published_at: string;
  media: RiderVoiceMedia[];
  replies: RiderVoice[];
}

export interface RiderVoiceSummary {
  average_rating: number | null;
  review_count: number;
  verified_percentage: number;
  media_count: number;
  question_count: number;
  answered_question_count: number;
  rating_distribution: Record<string, number>;
}

export interface RiderVoicesResponse {
  data: RiderVoice[];
  meta: {
    page: number;
    pages: number;
    count: number;
    per_page: number;
    summary: RiderVoiceSummary;
  };
}

const EMPTY_RESPONSE: RiderVoicesResponse = {
  data: [],
  meta: {
    page: 1,
    pages: 1,
    count: 0,
    per_page: 10,
    summary: {
      average_rating: null,
      review_count: 0,
      verified_percentage: 0,
      media_count: 0,
      question_count: 0,
      answered_question_count: 0,
      rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    },
  },
};

export async function getRiderVoices(
  productId: string,
): Promise<RiderVoicesResponse> {
  const baseUrl = process.env.SPREE_API_URL;
  if (!baseUrl) return EMPTY_RESPONSE;

  try {
    const response = await fetch(
      `${baseUrl}/api/v3/store/products/${encodeURIComponent(productId)}/rider_voices`,
      { next: { revalidate: 60, tags: [`rider-voices-${productId}`] } },
    );
    if (!response.ok) return EMPTY_RESPONSE;
    return (await response.json()) as RiderVoicesResponse;
  } catch {
    return EMPTY_RESPONSE;
  }
}
