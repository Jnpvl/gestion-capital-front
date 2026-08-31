export type CourseStatus = "draft" | "published";
export type CourseModality = "presencial" | "online" | "hibrido";
export type LessonBlockType = "video" | "text" | "presentation" | "quiz" | "file" | "image";
export type CourseAssetKind = "image" | "pdf";

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  coverImage: string | null;
  modality: string | null;
  status: CourseStatus;
  showInCatalog: boolean;
  featured: boolean;
  lessonsCount: number;
  studentsCount: number;
  createdAt: string;
}

export interface CoursePublicCard {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  coverImage: string | null;
  modality: string | null;
  duration: string | null;
  level: string | null;
  featured: boolean;
}

export interface CoursePublicDetail extends CoursePublicCard {
  description: string | null;
  highlights: string[];
}

export interface LessonBlock {
  id: string;
  type: LessonBlockType;
  title: string | null;
  content: string | null;
  resourceUrl: string | null;
  sortOrder: number;
}

export interface Lesson {
  id: string;
  title: string;
  sortOrder: number;
  blocks: LessonBlock[];
}

export interface CourseSection {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  coverImage: string | null;
  modality: CourseModality | null;
  duration: string | null;
  level: string | null;
  highlights: string[];
  status: CourseStatus;
  showInCatalog: boolean;
  featured: boolean;
  sections: CourseSection[];
  createdAt: string;
  updatedAt: string;
}

export function countCourseLessons(course: Pick<CourseDetail, "sections">) {
  return course.sections.reduce((total, section) => total + section.lessons.length, 0);
}

export interface CoursesListResponse {
  courses: CourseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const MODALITY_LABELS: Record<CourseModality, string> = {
  presencial: "Presencial",
  online: "En línea",
  hibrido: "Híbrido",
};

export const BLOCK_TYPE_LABELS: Record<LessonBlockType, string> = {
  video: "Video (YouTube)",
  text: "Texto",
  presentation: "Presentación (PDF)",
  quiz: "Quiz (opción múltiple)",
  file: "Archivo PDF",
  image: "Imagen",
};

export const DEFAULT_COVER_IMAGE = "/images/hero.jpg";
