import type { StpsOccupationItem, StpsThematicAreaItem } from "@/core/domain/students/types";
import type { ApiErrorBody } from "@/core/domain/auth/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { env } from "@/shared/config/env";

class StpsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "StpsApiError";
  }
}

async function fetchCatalog<T>(path: string, search?: string): Promise<T> {
  const token = authStorage.getToken();
  if (!token) {
    throw new StpsApiError("No hay sesión activa", 401);
  }

  const query = new URLSearchParams();
  if (search?.trim()) query.set("search", search.trim());

  const response = await fetch(
    `${env.apiUrl}/api/admin/stps/${path}${query.toString() ? `?${query.toString()}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new StpsApiError(
      error?.error?.message ?? "Error al cargar catálogo STPS",
      response.status,
      error?.error?.code,
    );
  }

  return data as T;
}

export async function listStpsOccupations(search?: string) {
  return fetchCatalog<{ occupations: StpsOccupationItem[] }>("occupations", search);
}

export async function listStpsThematicAreas(search?: string) {
  return fetchCatalog<{ thematicAreas: StpsThematicAreaItem[] }>("thematic-areas", search);
}

export { StpsApiError };
