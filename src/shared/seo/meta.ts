export const SITE_URL =
  import.meta.env.VITE_SITE_URL ?? "https://dotslashlearn.com";
export const SITE_NAME = "./learn";
export const DEFAULT_DESCRIPTION =
  "Bite-sized, interactive lessons on developer topics. Navigate with your keyboard.";
export const DEFAULT_OG_IMAGE = "/og-image.png";

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { charSet: string };

type LinkTag = { rel: string; href: string; [k: string]: string | undefined };

export interface SeoOptions {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article";
}

export function buildSeo(options: SeoOptions): {
  meta: MetaTag[];
  links: LinkTag[];
} {
  const fullTitle =
    options.path === "/"
      ? `${SITE_NAME} - Interactive dev lessons`
      : `${options.title} - ${SITE_NAME}`;
  const description = options.description ?? DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${options.path}`;
  const image = `${SITE_URL}${options.ogImage ?? DEFAULT_OG_IMAGE}`;
  const type = options.type ?? "website";

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:type", content: type },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:site_name", content: SITE_NAME },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export interface CourseLdOptions {
  title: string;
  description: string;
  slug: string;
  category: string;
}

export function buildCourseJsonLd(options: CourseLdOptions): string {
  const ld = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: options.title,
    description: options.description,
    url: `${SITE_URL}/lessons/${options.slug}`,
    learningResourceType: "Lesson",
    inLanguage: "en",
    about: options.category,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
  return JSON.stringify(ld);
}
