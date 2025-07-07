import axios from "axios";
import {
  Incident,
  IncidentStatus,
  IncidentPriority,
  AlertType,
  User,
} from "../types";

const API_BASE_URL = "http://localhost:8080/api";

type IncidentApiResponse = {
  total: number;
  data: Incident[];
};

type APIIncident = {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt?: string;
  description?: string;
  slaDeadline?: string;
  alertType?: string;
  facility?: string;
};

export const getAllIncidents = async (): Promise<Incident[]> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await axios.get<IncidentApiResponse>(
    `${API_BASE_URL}/incidents`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const apiIncidents = response.data.data; // now properly typed

  const incidents: Incident[] = apiIncidents.map((apiIncident) => ({
    id: apiIncident.id,
    title: apiIncident.title,
    status: apiIncident.status as IncidentStatus,
    priority: apiIncident.priority as IncidentPriority,
    location: apiIncident.facility || "",
    alertType: (apiIncident.alertType as AlertType) || "equipment",
    reportedBy: {
      id: "system",
      name: "System",
      role: "admin",
      email: "system@example.com",
    } as User,
    createdAt: new Date(apiIncident.createdAt),
    updatedAt: apiIncident.updatedAt
      ? new Date(apiIncident.updatedAt)
      : new Date(apiIncident.createdAt),
    description: apiIncident.description || "No description provided",
    slaDeadline: apiIncident.slaDeadline
      ? new Date(apiIncident.slaDeadline)
      : new Date(),
    notes: [],
    escalationLevel: 0,
    acknowledgedAt: undefined,
    resolvedAt: undefined,
    closedAt: undefined,
    assignedTo: undefined,
  }));

  return incidents;
};

export const getIncidentById = async (id: string): Promise<Incident> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await axios.get<APIIncident>(
    `${API_BASE_URL}/incidents/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const apiIncident = response.data;

  const incident: Incident = {
    id: apiIncident.id,
    title: apiIncident.title,
    status: apiIncident.status as IncidentStatus,
    priority: apiIncident.priority as IncidentPriority,
    location: apiIncident.facility || "",
    alertType: (apiIncident.alertType as AlertType) || "equipment",
    reportedBy: {
      id: "system",
      name: "System",
      role: "admin",
      email: "system@example.com",
    } as User,
    createdAt: new Date(apiIncident.createdAt),
    updatedAt: apiIncident.updatedAt
      ? new Date(apiIncident.updatedAt)
      : new Date(apiIncident.createdAt),
    description: apiIncident.description || "No description provided",
    slaDeadline: apiIncident.slaDeadline
      ? new Date(apiIncident.slaDeadline)
      : new Date(),
    notes: [],
    escalationLevel: 0,
    acknowledgedAt: undefined,
    resolvedAt: undefined,
    closedAt: undefined,
    assignedTo: undefined,
  };

  return incident;
};

export const createIncident = async (
  incidentData: Partial<Incident>
): Promise<Incident> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await axios.post<APIIncident>(
    `${API_BASE_URL}/incidents`,
    incidentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const apiIncident = response.data;

  const incident: Incident = {
    id: apiIncident.id,
    title: apiIncident.title,
    status: apiIncident.status as IncidentStatus,
    priority: apiIncident.priority as IncidentPriority,
    location: apiIncident.facility || "",
    alertType: (apiIncident.alertType as AlertType) || "equipment",
    reportedBy: {
      id: "system",
      name: "System",
      role: "admin",
      email: "system@example.com",
    } as User,
    createdAt: new Date(apiIncident.createdAt),
    updatedAt: apiIncident.updatedAt
      ? new Date(apiIncident.updatedAt)
      : new Date(apiIncident.createdAt),
    description: apiIncident.description || "No description provided",
    slaDeadline: apiIncident.slaDeadline
      ? new Date(apiIncident.slaDeadline)
      : new Date(),
    notes: [],
    escalationLevel: 0,
    acknowledgedAt: undefined,
    resolvedAt: undefined,
    closedAt: undefined,
    assignedTo: undefined,
  };

  return incident;
};

export const updateIncidentStatus = async (
  id: string,
  status: string
): Promise<void> => {
  const token = sessionStorage.getItem("idToken") || "";

  await axios.put(
    `${API_BASE_URL}/incidents/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const assignIncident = async (
  id: string,
  userId: string
): Promise<void> => {
  const token = sessionStorage.getItem("idToken") || "";

  await axios.put(
    `${API_BASE_URL}/incidents/${id}/assign`,
    { userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getFacilities = async (): Promise<string[]> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await axios.get<string[]>(
    `${API_BASE_URL}/incidents/facilities`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
