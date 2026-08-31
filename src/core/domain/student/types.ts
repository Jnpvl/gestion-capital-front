export interface StudentUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface StudentLoginResponse {
  token: string;
  user: StudentUser;
}

export interface StudentMeResponse {
  user: StudentUser;
}

export interface StudentCourseListItem {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  coverImage: string | null;
  modality: string | null;
  lessonsCount: number;
  completedLessons: number;
  progressPercent: number;
  enrolledAt: string;
}

export interface StudentCoursesListResponse {
  courses: StudentCourseListItem[];
}

export interface StudentCourseDetailResponse {
  course: import("@/core/domain/courses/types").CourseDetail;
}
