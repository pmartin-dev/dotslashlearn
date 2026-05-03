export interface Chapter {
  title: string;
  startStep: number;
  endStep: number;
}

export function extractChapters(steps: string[]): Chapter[] {
  const chapterStarts: { step: number; title: string }[] = [];

  for (let i = 0; i < steps.length; i++) {
    const withoutFences = steps[i].replace(/```[\s\S]*?```/g, "");
    const match = withoutFences.match(/^##\s+(.+)/m);
    if (match) chapterStarts.push({ step: i, title: match[1].trim() });
  }

  if (chapterStarts.length < 2) return [];

  const chapters: Chapter[] = [];

  if (chapterStarts[0].step > 0) {
    chapters.push({ title: "Intro", startStep: 0, endStep: chapterStarts[0].step - 1 });
  }

  for (let i = 0; i < chapterStarts.length; i++) {
    chapters.push({
      title: chapterStarts[i].title,
      startStep: chapterStarts[i].step,
      endStep: i + 1 < chapterStarts.length ? chapterStarts[i + 1].step - 1 : steps.length - 1,
    });
  }

  return chapters;
}

export function getChapterIndex(chapters: Chapter[], step: number): number {
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (step >= chapters[i].startStep) return i;
  }
  return 0;
}
