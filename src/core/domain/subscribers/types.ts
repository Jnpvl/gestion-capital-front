export type SubscriberStatus = "active" | "unsubscribed";

export interface SubscriberListItem {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: SubscriberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribersListResponse {
  subscribers: SubscriberListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubscribeInput {
  name: string;
  email: string;
  company?: string;
}

export interface SubscribeResponse {
  subscriber: SubscriberListItem;
  alreadySubscribed: boolean;
  reactivated?: boolean;
}
