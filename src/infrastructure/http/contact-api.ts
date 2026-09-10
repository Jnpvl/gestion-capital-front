import type { ApiErrorBody } from "@/core/domain/auth/types";
import { env } from "@/shared/config/env";

export interface ContactMessageInput {
  nombre: string;
  empresa?: string;
  email: string;
  telefono?: string;
  servicio?: string;
  mensaje: string;
}

class ContactApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ContactApiError";
  }
}

export async function sendContactMessage(input: ContactMessageInput): Promise<void> {
  const response = await fetch(`${env.apiUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new ContactApiError(
      error?.error?.message ?? "No se pudo enviar el mensaje",
      response.status,
      error?.error?.code,
    );
  }
}

export { ContactApiError };
