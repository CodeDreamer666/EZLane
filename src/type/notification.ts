export type NotificationAudience = "freelancer" | "client";

export interface AppNotification {
  id: string;
  projectId: string;
  audience: NotificationAudience;
  title: string;
  ts: number;
  read: boolean;
  route: string;
}