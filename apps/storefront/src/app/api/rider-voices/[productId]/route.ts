import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/spree/cookies";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: { message: "Sign in to contribute" } },
      { status: 401 },
    );
  }

  const { productId } = await context.params;
  const baseUrl = process.env.SPREE_API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: { message: "Review service is unavailable" } },
      { status: 503 },
    );
  }

  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : await request.text();

  const response = await fetch(
    `${baseUrl}/api/v3/store/products/${encodeURIComponent(productId)}/rider_voices`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(!contentType.includes("multipart/form-data")
          ? { "Content-Type": contentType || "application/json" }
          : {}),
      },
      body,
      cache: "no-store",
    },
  );

  const payload = await response.json();
  if (response.ok) {
    revalidateTag(`rider-voices-${productId}`, "max");
  }

  return NextResponse.json(payload, { status: response.status });
}
