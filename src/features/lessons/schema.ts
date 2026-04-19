import { z } from "zod/v4";

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  order: z.number().default(0),
  draft: z.boolean().default(false),
  category: z.string(),
  subcategory: z.string().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface LessonMeta extends Frontmatter {
  slug: string;
  stepCount: number;
}

export interface Lesson extends LessonMeta {
  steps: string[];
}

export interface CategoryMeta {
  name: string;
  slug: string;
  lessonCount: number;
  lessonSlugs: string[];
  lessonTitles: string[];
  subcategories: string[];
}

export interface CategoryDetail {
  name: string;
  slug: string;
  subcategories: { name: string; lessons: LessonMeta[] }[];
  uncategorized: LessonMeta[];
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}
