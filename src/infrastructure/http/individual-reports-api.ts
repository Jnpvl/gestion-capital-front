import { authStorage } from "@/infrastructure/auth/auth-storage";
import { companyAuthStorage } from "@/infrastructure/auth/company-auth-storage";
import { staffFetch, companyFetch } from "./session-fetch";
import { env } from "@/shared/config/env";

export async function downloadIndividualReport(input: {
  companyId: string; studentId: string; year: number; portal: boolean;
  guide?: "nom035_guia2" | "nom035_guia3";
}) {
  const token = input.portal ? companyAuthStorage.getToken() : authStorage.getToken();
  if (!token) throw new Error("No hay sesión activa");
  const query = new URLSearchParams({ year: String(input.year) });
  if (input.guide) query.set("guide", input.guide);
  const base = input.portal ? "/api/company" : `/api/admin/companies/${encodeURIComponent(input.companyId)}`;
  const response = await (input.portal ? companyFetch : staffFetch)(`${env.apiUrl}${base}/employees/${encodeURIComponent(input.studentId)}/report?${query}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? "No se pudo generar el reporte individual");
  }
  const blob = await response.blob();
  const filename = response.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/)?.[1] ?? `reporte-individual-${input.studentId}-${input.year}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
