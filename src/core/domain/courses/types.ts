export type CourseStatus = "draft" | "published";
export type CourseModality = "presencial" | "online" | "hibrido";
export type LessonBlockType =
  | "video"
  | "text"
  | "presentation"
  | "quiz"
  | "file"
  | "image"
  | "assignment";
export type CourseAssetKind = "image" | "pdf";

export interface CourseParticipantProfile {
  psychographics: string;
  knowledge: string;
  skills: string;
}

export interface CourseObjectiveItem {
  label: string;
  text: string;
}

export interface CourseObjectives {
  general: string;
  items: CourseObjectiveItem[];
}

export interface CourseSyllabusUnit {
  title: string;
  topics: string[];
}

export const EMPTY_PARTICIPANT_PROFILE: CourseParticipantProfile = {
  psychographics: "",
  knowledge: "",
  skills: "",
};

export const EMPTY_OBJECTIVES: CourseObjectives = {
  general: "",
  items: [],
};

export function normalizeParticipantProfile(
  value?: CourseParticipantProfile | null,
): CourseParticipantProfile {
  return {
    psychographics: value?.psychographics?.trim() ?? "",
    knowledge: value?.knowledge?.trim() ?? "",
    skills: value?.skills?.trim() ?? "",
  };
}

export function normalizeObjectives(value?: CourseObjectives | null): CourseObjectives {
  return {
    general: value?.general?.trim() ?? "",
    items: (value?.items ?? [])
      .map((item) => ({
        label: item.label?.trim() ?? "",
        text: item.text?.trim() ?? "",
      }))
      .filter((item) => item.text.length > 0),
  };
}

export function normalizeSyllabus(value?: CourseSyllabusUnit[] | null): CourseSyllabusUnit[] {
  return (value ?? [])
    .map((unit) => ({
      title: unit.title?.trim() ?? "",
      topics: (unit.topics ?? []).map((topic) => topic.trim()).filter(Boolean),
    }))
    .filter((unit) => unit.title.length > 0);
}

export function hasParticipantProfile(profile: CourseParticipantProfile): boolean {
  return Boolean(profile.psychographics || profile.knowledge || profile.skills);
}

export function hasObjectives(objectives: CourseObjectives): boolean {
  return Boolean(objectives.general || objectives.items.length > 0);
}

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
  instructorId: string | null;
  instructorName: string | null;
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
  participantProfile: CourseParticipantProfile;
  objectives: CourseObjectives;
  syllabus: CourseSyllabusUnit[];
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
  isFinalExam?: boolean;
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
  participantProfile?: CourseParticipantProfile | null;
  objectives?: CourseObjectives | null;
  syllabus?: CourseSyllabusUnit[] | null;
  status: CourseStatus;
  showInCatalog: boolean;
  featured: boolean;
  certificateTemplateUrl?: string | null;
  dc3TemplateUrl?: string | null;
  instructorId?: string | null;
  location?: string | null;
  period?: string | null;
  stpsThematicAreaCode?: string | null;
  stpsThematicAreaName?: string | null;
  instructor?: CourseInstructorSnapshot | null;
  sections: CourseSection[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseInstructorSnapshot {
  id: string;
  name: string;
  career: string | null;
  professionalArea: string | null;
  aceStpsRegistration: string | null;
  renapConocer: string | null;
  professionalLicense: string | null;
  photoUrl?: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
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
  assignment: "Tarea (entrega)",
};

export const DEFAULT_COVER_IMAGE = "/images/hero.jpg";
