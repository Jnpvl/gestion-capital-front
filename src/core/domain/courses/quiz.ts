export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizContent {
  instructions: string;
  questions: QuizQuestion[];
  passingScore?: number;
}

export function createEmptyQuiz(): QuizContent {
  return { instructions: "", questions: [] };
}

export function createQuizQuestion(): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    question: "",
    options: ["", ""],
    correctIndex: 0,
  };
}

export function parseQuizContent(raw: string | null | undefined): QuizContent {
  if (!raw?.trim()) return createEmptyQuiz();

  try {
    const parsed = JSON.parse(raw) as Partial<QuizContent>;
    if (!parsed || !Array.isArray(parsed.questions)) {
      return { instructions: raw, questions: [] };
    }

    return {
      instructions: typeof parsed.instructions === "string" ? parsed.instructions : "",
      passingScore:
        typeof parsed.passingScore === "number" && parsed.passingScore > 0
          ? parsed.passingScore
          : undefined,
      questions: parsed.questions
        .filter((q) => q && typeof q.question === "string")
        .map((q) => ({
          id: q.id || crypto.randomUUID(),
          question: q.question ?? "",
          options: Array.isArray(q.options)
            ? q.options.filter((o): o is string => typeof o === "string")
            : ["", ""],
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        })),
    };
  } catch {
    return { instructions: raw, questions: [] };
  }
}

export function serializeQuizContent(quiz: QuizContent): string {
  return JSON.stringify(quiz);
}

export function isQuizReady(quiz: QuizContent): boolean {
  return quiz.questions.some((q) => {
    const validOptions = q.options
      .map((option, index) => ({ option: option.trim(), index }))
      .filter((item) => item.option);

    if (!q.question.trim() || validOptions.length < 2) return false;

    const correctOption = q.options[q.correctIndex]?.trim();
    return Boolean(correctOption);
  });
}

export function countReadyQuizQuestions(quiz: QuizContent): number {
  return quiz.questions.filter((q) => {
    const validOptions = q.options
      .map((option) => option.trim())
      .filter(Boolean);
    return q.question.trim() && validOptions.length >= 2;
  }).length;
}

export const QUIZ_PASSING_PERCENT = 80;

export function getQuizPassingScore(_quiz: QuizContent, readyQuestionCount: number): number {
  if (!readyQuestionCount) return 1;
  return Math.max(1, Math.ceil((readyQuestionCount * QUIZ_PASSING_PERCENT) / 100));
}
