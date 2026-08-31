export interface LessonProgressItem {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  lastAccessedAt: string;
}

export interface BlockProgressItem {
  blockId: string;
  answers: Record<string, number>;
  verified: boolean;
  score: number | null;
  totalQuestions: number | null;
  updatedAt: string;
}

export interface CourseProgress {
  lastLessonId: string | null;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  lessons: LessonProgressItem[];
  blocks: BlockProgressItem[];
}

export interface SaveCourseProgressInput {
  lastLessonId?: string;
  lessonUpdates?: Array<{
    lessonId: string;
    completed?: boolean;
    accessed?: boolean;
  }>;
  blockUpdates?: Array<{
    blockId: string;
    answers?: Record<string, number>;
    verified?: boolean;
    score?: number;
    totalQuestions?: number;
  }>;
}

export interface CourseProgressResponse {
  progress: CourseProgress;
}

export interface QuizProgressState {
  answers: Record<string, number>;
  verified: boolean;
  score?: number;
  totalQuestions?: number;
}
