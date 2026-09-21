import type { ApiErrorBody } from "@/core/domain/auth/types";
import type { SubscribeInput, SubscribeResponse } from "@/core/domain/subscribers/types";
import { env } from "@/shared/config/env";

class SubscribeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SubscribeApiError";
  }
}

export async function subscribeToNewsletter(input: SubscribeInput): Promise<SubscribeResponse> {
  const response = await fetch(`${env.apiUrl}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new SubscribeApiError(
      error?.error?.message ?? "No se pudo completar la suscripción",
      response.status,
      error?.error?.code,
    );
  }

  return data as SubscribeResponse;
}

export { SubscribeApiError };
