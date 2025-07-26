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

// notification types
export type NotificationType =
  | "incident"
  | "incident_assigned"
  | "incident_created"
  | "incident_updated"
  | "incident_resolved"
  | "incident_escalated"
  | "incident_acknowledged"
  | "emergency_broadcast"
  | "bulk_operation"
  | "alert"
  | "update"
  | "system";

export type NotificationSeverity = "low" | "medium" | "high" | "critical";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  facility: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  isRead: boolean;
  incidentId?: string;
  alertId?: string;
  actionUrl?: string;
  recipients: string[];
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error?: string;
}

// Extend your existing interfaces if needed
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  facilityName: string;
  department: string;
  role: string;
  group: string;
  isActive: boolean;
  createdAt: {
    seconds: number;
    nanos: number;
  };
  updatedAt: {
    seconds: number;
    nanos: number;
  };
  displayName: string;
  uid: string;
  createdAtAsTimestamp: {
    seconds: number;
    nanos: number;
  };
  updatedAtAsTimestamp: {
    seconds: number;
    nanos: number;
  };
  // Add notification preferences if needed
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    incidentTypes: AlertType[];
    severityLevels: NotificationSeverity[];
  };
}

export interface UserOption {
  fullName: string;
  role: string;
}

export interface Author {
  id: string;
  fullName: string;
  role: string;
  email?: string;
}

export interface Note {
  id: string;
  content: string;
  author: Author;
  createdAt: Date;
  type?: "system" | "user" | "escalation";
  isInternal: boolean;
}

export interface ServerNote {
  id: string;
  content: string;
  author: {
    id: string;
    fullName: string;
    role: string;
  };
  createdAt: string | Date;
  type: string;
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
  notesCount?: number;  
  escalationLevel: number;
  slaDeadline?: Date;
  additionalContext?: string;
  // Add notification tracking if needed
  lastNotificationSent?: Date;
  notificationsSent?: number;
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
  // Add notification tracking for alerts too
  facility?: string;
  lastNotificationSent?: Date;
  notificationsSent?: number;
}

// Helper types for notification creation
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  facility: string;
  severity: NotificationSeverity;
  incidentId?: string;
  alertId?: string;
  actionUrl?: string;
  recipients?: string[]; // If not provided, will notify all facility users
  metadata?: Record<string, unknown>;
}

export interface NotificationFilter {
  facility?: string;
  type?: NotificationType;
  severity?: NotificationSeverity;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: Timestamp;
  chatId?: string;
  participants?: string[];
}

export interface UserData {
  fullName: string;
  phoneNumber?: string;
  department?: string;
  role?: string;
  remoteWork?: boolean;
  quietMode?: boolean;
  notificationsEnabled?: boolean;
}
