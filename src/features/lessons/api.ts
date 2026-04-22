import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { frontmatterSchema, isValidSlug, toSlug } from "./schema";
import type { CategoryDetail, CategoryMeta, Lesson, LessonMeta } from "./schema";

const LESSONS_DIR = path.join(process.cwd(), "content/lessons");

function splitSteps(content: string): string[] {
  return content
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function countQuizzes(content: string): number {
  const matches = content.match(/```quiz/g);
  return matches ? matches.length : 0;
}

function parseLessonMeta(slug: string): LessonMeta | null {
  const filePath = path.join(LESSONS_DIR, `${slug}.mdx`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const parsed = frontmatterSchema.parse(data);
    // Use splitSteps for consistency with parseLessonFull
    const stepCount = splitSteps(content).length;
    const quizCount = countQuizzes(content);

    return { slug, ...parsed, stepCount, quizCount };
  } catch (err) {
    console.error(`Failed to parse lesson meta "${slug}":`, err);
    return null;
  }
}

function parseLessonFull(slug: string): Lesson | null {
  const filePath = path.join(LESSONS_DIR, `${slug}.mdx`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const parsed = frontmatterSchema.parse(data);
    const steps = splitSteps(content);
    const quizCount = countQuizzes(content);

    return { slug, ...parsed, stepCount: steps.length, quizCount, steps };
  } catch (err) {
    console.error(`Failed to parse lesson "${slug}":`, err);
    return null;
  }
}

export function getAllLessons(): LessonMeta[] {
  try {
    const files = fs
      .readdirSync(LESSONS_DIR)
      .filter((f) => f.endsWith(".mdx"));

    return files
      .map((f) => parseLessonMeta(f.replace(/\.mdx$/, "")))
      .filter((meta): meta is LessonMeta => meta !== null)
      .sort((a, b) => a.order - b.order);
  } catch (err) {
    console.error("Failed to read lessons directory:", err);
    return [];
  }
}

export function getLesson(slug: string): Lesson | null {
  if (!isValidSlug(slug)) return null;

  const filePath = path.join(LESSONS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const lesson = parseLessonFull(slug);
  if (!lesson || lesson.draft) return null;

  return lesson;
}

export function getAllCategories(): CategoryMeta[] {
  const lessons = getAllLessons();
  const grouped = new Map<string, LessonMeta[]>();

  for (const lesson of lessons) {
    const existing = grouped.get(lesson.category) ?? [];
    existing.push(lesson);
    grouped.set(lesson.category, existing);
  }

  return Array.from(grouped.entries())
    .map(([name, items]) => {
      const nonDraft = items.filter((l) => !l.draft);
      const subcategories = [
        ...new Set(items.map((l) => l.subcategory).filter(Boolean)),
      ] as string[];

      return {
        name,
        slug: toSlug(name),
        lessonCount: nonDraft.length,
        lessonSlugs: nonDraft.map((l) => l.slug),
        lessonTitles: nonDraft.map((l) => l.title),
        subcategories,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getLessonsByCategory(
  categorySlug: string,
): CategoryDetail | null {
  const lessons = getAllLessons();
  const matching = lessons.filter((l) => toSlug(l.category) === categorySlug);

  if (matching.length === 0) return null;

  const categoryName = matching[0].category;
  const subMap = new Map<string, LessonMeta[]>();
  const uncategorized: LessonMeta[] = [];

  for (const lesson of matching) {
    if (lesson.subcategory) {
      const existing = subMap.get(lesson.subcategory) ?? [];
      existing.push(lesson);
      subMap.set(lesson.subcategory, existing);
    } else {
      uncategorized.push(lesson);
    }
  }

  const subcategories = Array.from(subMap.entries())
    .map(([name, items]) => ({ name, lessons: items }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    name: categoryName,
    slug: categorySlug,
    subcategories,
    uncategorized,
  };
}
