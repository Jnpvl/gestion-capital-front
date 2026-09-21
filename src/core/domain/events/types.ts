export type EventStatus = "draft" | "published";

export interface EventPublicItem {
  id: string;
  title: string;
  eventType: string;
  modality: string;
  dateLabel: string;
  description: string;
}

export interface EventListItem extends EventPublicItem {
  status: EventStatus;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventsListResponse {
  events: EventListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventFormValues {
  title: string;
  eventType: string;
  modality: string;
  dateLabel: string;
  description: string;
  status: EventStatus;
  isVisible: boolean;
  sortOrder: number;
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: "",
  eventType: "Capacitación",
  modality: "Presencial / Híbrido",
  dateLabel: "Próximamente",
  description: "",
  status: "draft",
  isVisible: true,
  sortOrder: 0,
};
