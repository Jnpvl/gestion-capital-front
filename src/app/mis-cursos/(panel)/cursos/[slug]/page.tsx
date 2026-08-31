import { StudentCoursePlayer } from "@/presentation/components/student/student-course-player";

interface StudentCoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudentCoursePage({ params }: StudentCoursePageProps) {
  const { slug } = await params;
  return <StudentCoursePlayer slug={slug} />;
}
