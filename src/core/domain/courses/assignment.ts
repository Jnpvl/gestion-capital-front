export type AssignmentSubmissionStatus = "pending" | "approved" | "returned";

export interface AssignmentBlockContent {
  instructions: string;
  required: boolean;
}

export interface AssignmentProgressItem {
  blockId: string;
  submissionId: string | null;
  status: AssignmentSubmissionStatus | "none";
  attemptNumber: number;
  fileUrl: string | null;
  fileName: string | null;
  studentComment: string | null;
  reviewerComment: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface AssignmentSubmissionListItem {
  id: string;
  enrollmentId: string;
  blockId: string;
  attemptNumber: number;
  fileUrl: string;
  fileName: string | null;
  studentComment: string | null;
  status: AssignmentSubmissionStatus;
  reviewerComment: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  submittedAt: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string | null;
  lessonTitle: string;
  sectionTitle: string;
}

export function createEmptyAssignmentContent(): AssignmentBlockContent {
  return { instructions: "", required: true };
}

export function parseAssignmentContent(
  raw: string | null | undefined,
): AssignmentBlockContent {
  if (!raw?.trim()) return createEmptyAssignmentContent();

  try {
    const parsed = JSON.parse(raw) as Partial<AssignmentBlockContent>;
    if (!parsed || typeof parsed !== "object") {
      return { instructions: raw, required: true };
    }

    return {
      instructions:
        typeof parsed.instructions === "string" ? parsed.instructions : raw,
      required: parsed.required !== false,
    };
  } catch {
    return { instructions: raw, required: true };
  }
}

export function serializeAssignmentContent(content: AssignmentBlockContent): string {
  return JSON.stringify({
    instructions: content.instructions ?? "",
    required: content.required !== false,
  });
}
