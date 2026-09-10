import type { CourseDetail } from "@/core/domain/courses/types";
import { parseQuizContent } from "@/core/domain/courses/quiz";

export interface FinalExamInfo {
  sectionId: string;
  lessonId: string;
  blockId: string;
}

export function findFinalExamInfo(course: Pick<CourseDetail, "sections">): FinalExamInfo | null {
  for (const section of course.sections) {
    if (!section.isFinalExam) continue;

    const lesson = section.lessons[0];
    const block = lesson?.blocks.find((item) => item.type === "quiz") ?? lesson?.blocks[0];
    if (!lesson || !block) return null;

    return {
      sectionId: section.id,
      lessonId: lesson.id,
      blockId: block.id,
    };
  }

  return null;
}

export function getFinalExamQuizContent(course: Pick<CourseDetail, "sections">) {
  for (const section of course.sections) {
    if (!section.isFinalExam) continue;

    const block = section.lessons[0]?.blocks.find((item) => item.type === "quiz");
    if (!block) return null;

    return parseQuizContent(block.content);
  }

  return null;
}
