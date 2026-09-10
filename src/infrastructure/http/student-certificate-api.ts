import { env } from "@/shared/config/env";
import { studentAuthStorage } from "@/infrastructure/auth/student-auth-storage";

function filenameFromDisposition(disposition: string | null, fallback: string): string {
  const match = (disposition ?? "").match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? fallback;
}

export async function downloadCourseCertificate(slug: string): Promise<void> {
  const token = studentAuthStorage.getToken();
  if (!token) {
    throw new Error("No hay sesión activa");
  }

  const response = await fetch(`${env.apiUrl}/api/student/courses/${slug}/certificate`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message ?? "No se pudo descargar la constancia");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filenameFromDisposition(
    response.headers.get("Content-Disposition"),
    `constancia-${slug}.pdf`,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadCourseDc3(slug: string): Promise<void> {
  const token = studentAuthStorage.getToken();
  if (!token) {
    throw new Error("No hay sesión activa");
  }

  const response = await fetch(`${env.apiUrl}/api/student/courses/${slug}/certificate/dc3`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message ?? "No se pudo descargar el DC3");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filenameFromDisposition(
    response.headers.get("Content-Disposition"),
    `dc3-${slug}.pdf`,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
