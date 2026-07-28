import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PolicyExperience } from "@/components/policy/PolicyExperience";
import { DEFAULT_POLICY_CONTENT } from "@/lib/constants/policy-content";
import { getPolicy } from "@/lib/data/policies";
import { buildCanonicalUrl } from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";

const POLICY_DESCRIPTIONS: Record<string, string> = {
  "shipping-policy":
    "Understand how Mile 27 Store processes, dispatches, tracks and delivers motorcycle equipment orders across India.",
  "privacy-policy":
    "Learn what information Mile 27 Store collects, why it is used, how it is protected and the choices available to you.",
  "returns-policy":
    "Understand return eligibility, inspections, exchanges and refunds for purchases from Mile 27 Store.",
  "terms-of-service":
    "Read the terms governing orders, payments, accounts and use of the Mile 27 Store website.",
};

interface PolicyPageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { slug, locale, country } = await params;
  const policy = await getPolicy(slug);

  if (!policy) {
    const t = await getTranslations({
      locale: locale as Locale,
      namespace: "policies",
    });
    return {
      title: t("policyNotFound"),
      description: t("noContent"),
    };
  }

  const description =
    POLICY_DESCRIPTIONS[slug] ||
    `Read the current ${policy.name} for Mile 27 Store.`;
  const storeUrl = getStoreUrl();
  const canonical = storeUrl
    ? buildCanonicalUrl(storeUrl, `/${country}/${locale}/policies/${slug}`)
    : undefined;

  return {
    title: policy.name,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: policy.name,
      description,
      url: canonical,
    },
  };
}

export default async function PolicyPage({
  params,
}: PolicyPageProps): Promise<React.JSX.Element> {
  const { slug, locale, country } = await params;
  const [policy, t] = await Promise.all([
    getPolicy(slug),
    getTranslations({ locale: locale as Locale, namespace: "policies" }),
  ]);

  if (!policy) {
    notFound();
  }

  const fallbackBody = DEFAULT_POLICY_CONTENT[slug];
  const bodyHtml = policy.body_html || fallbackBody;

  if (!bodyHtml && !policy.body)
    return (
      <p className="mx-auto max-w-7xl px-6 py-24 text-black/50">
        {t("noContent")}
      </p>
    );

  return (
    <PolicyExperience
      basePath={`/${country}/${locale}`}
      body={policy.body}
      bodyHtml={bodyHtml}
      name={policy.name}
      slug={slug}
      updatedAt={(policy as typeof policy & { updated_at?: string }).updated_at}
    />
  );
}
