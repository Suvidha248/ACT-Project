import { Timestamp } from "firebase/firestore";

export type IncidentStatus =
  | "new"
  | "acknowledged"
  | "in-progress"
  | "resolved"
  | "closed";

export type IncidentPriority = "low" | "medium" | "high" | "critical";

export type AlertType =
  | "temperature"
  | "humidity"
  | "security"
  | "equipment"
  | "inventory"
  | "safety";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface UserOption {
  fullName: string;
  role: string;
}

export interface Note {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  isInternal: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  alertType: AlertType;
  location: string;
  facility?: string;
  assignedTo?: User;
  reportedBy: User;
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  notes: Note[];
  escalationLevel: number;
  slaDeadline: Date;
  additionalContext?: string;
}

export interface IncidentStats {
  total: number;
  new: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
}

export interface Alert {
  id?: number;
  system: string;
  type: string;
  level: string;
  notification: string[];
  role?: string;
  fullName?: string;
}

export interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: Timestamp;
  chatId?: string;
  participants?: string[];
}

export type NotificationMessage = {
  id: number;
  message: string;
  read: boolean;
  type: string;
  role: string;
  timestamp: string;
};
