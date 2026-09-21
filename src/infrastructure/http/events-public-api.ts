import type { EventPublicItem } from "@/core/domain/events/types";
import { env } from "@/shared/config/env";

export async function fetchPublicEvents(): Promise<EventPublicItem[]> {
  try {
    const response = await fetch(`${env.apiUrl}/api/events`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { events?: EventPublicItem[] };
    return data.events ?? [];
  } catch {
    return [];
  }
}
