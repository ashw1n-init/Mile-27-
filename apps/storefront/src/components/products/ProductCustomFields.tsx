import type { CustomField } from "@spree/sdk";
import { useTranslations } from "next-intl";

interface ProductCustomFieldsProps {
  customFields?: Array<CustomField>;
  theme?: "light" | "dark";
}

function renderBooleanValue(
  value: unknown,
  t: ReturnType<typeof useTranslations<"products">>,
): React.ReactNode {
  return value ? t("yes") : t("no");
}

function renderValue(
  field: CustomField,
  t: ReturnType<typeof useTranslations<"products">>,
): React.ReactNode {
  switch (field.field_type) {
    case "boolean":
      return renderBooleanValue(field.value, t);
    case "json":
      return typeof field.value === "string"
        ? field.value
        : JSON.stringify(field.value);
    case "rich_text":
      // Value is admin-authored HTML from the Spree CMS backend (trusted source)
      return <span dangerouslySetInnerHTML={{ __html: field.value ?? "" }} />;
    case "short_text":
    case "long_text":
    case "number":
      return String(field.value);
    default:
      return String(field.value);
  }
}

export function ProductCustomFields({
  customFields,
  theme = "light",
}: ProductCustomFieldsProps): React.JSX.Element | null {
  const t = useTranslations("products");

  if (!customFields || customFields.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-16 border-t pt-10 ${
        theme === "dark" ? "border-white/15" : "border-zinc-200"
      }`}
    >
      <h2
        className={`mb-8 text-2xl font-medium ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        {t("properties")}
      </h2>
      <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {customFields.map((field) => (
          <div key={field.id}>
            <dt className="text-xs text-zinc-500">{field.label}</dt>
            <dd
              className={`mt-3 min-w-0 text-base ${
                theme === "dark" ? "text-zinc-100" : "text-gray-900"
              }`}
            >
              {renderValue(field, t)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
