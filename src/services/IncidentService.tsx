import axios from "axios";
import { AlertType, Incident, IncidentPriority, IncidentStatus, Note } from "../types";

const API_BASE_URL = "http://localhost:8080/api";

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
  assignedTo?: {
    id: string;
    name: string;
    email?: string;
    role: string;
    department: string;
  };
  reportedBy?: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
};

const getAuthHeader = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("idToken") || ""}`,
});

// 🔷 Form Data type for create incident
export type IncidentFormData = {
  title: string;
  description: string;
  location: string;
  priority: IncidentPriority;
  alertType: AlertType;
  additionalDetails?: string;
};

// 🔷 Filters and response types
export interface IncidentFilters {
  facility?: string;
  status?: string;
  priority?: string;
  page?: number;
  size?: number;
}

export interface FilteredIncidentResponse {
  data: Incident[];
  total: number;
}

// 🔷 Transform API response to Incident
const transformAPIIncident = (api: APIIncident): Incident => ({
  id: api.id,
  title: api.title,
  status: api.status as IncidentStatus,
  priority: api.priority.toLowerCase() as IncidentPriority,
  location: api.facility || "",
  alertType: (api.alertType?.toLowerCase() as AlertType) || "equipment",
  assignedTo: api.assignedTo
    ? {
        id: api.assignedTo.id,
        name: api.assignedTo.name,
        email: api.assignedTo.email || "no-email@example.com",
        role: api.assignedTo.role,
        department: api.assignedTo.department,
      }
    : undefined,
  reportedBy: api.reportedBy
    ? {
        id: api.reportedBy.id,
        name: api.reportedBy.name,
        email: api.reportedBy.email || "system@example.com",
        role: api.reportedBy.role,
        department: "General",
      }
    : {
        id: "system",
        name: "System",
        email: "system@example.com",
        role: "admin",
        department: "General",
      },
  createdAt: new Date(api.createdAt),
  updatedAt: api.updatedAt ? new Date(api.updatedAt) : new Date(api.createdAt),
  description: api.description || "No description provided",
  slaDeadline: api.slaDeadline ? new Date(api.slaDeadline) : new Date(),
  notes: [],
  escalationLevel: 0,
  acknowledgedAt: undefined,
  resolvedAt: undefined,
  closedAt: undefined,
});

// 🔷 Get filtered incidents
export const getFilteredIncidents = async (filters: IncidentFilters = {}): Promise<FilteredIncidentResponse> => {
  const params = new URLSearchParams();
  if (filters.facility && filters.facility !== "all") params.append("facility", filters.facility);
  if (filters.status && filters.status !== "all") params.append("status", filters.status);
  if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
  if (filters.page !== undefined) params.append("page", filters.page.toString());
  if (filters.size !== undefined) params.append("size", filters.size.toString());

  const response = await axios.get<{ data: APIIncident[]; total: number }>(
    `${API_BASE_URL}/incidents?${params.toString()}`,
    { headers: getAuthHeader() }
  );

  return {
    data: response.data.data.map(transformAPIIncident),
    total: response.data.total || response.data.data.length,
  };
};

// 🔷 Get incident by ID
export const getIncidentById = async (id: string): Promise<Incident> => {
  const response = await axios.get<APIIncident>(`${API_BASE_URL}/incidents/${id}`, {
    headers: getAuthHeader(),
  });
  return transformAPIIncident(response.data);
};

// 🔷 Create incident
export const createIncident = async (incidentData: IncidentFormData): Promise<Incident> => {
  const payload = {
    title: incidentData.title,
    description: incidentData.description,
    facility: incidentData.location,
    location: incidentData.location,
    priority: incidentData.priority.toUpperCase(),
    alertType: incidentData.alertType.toUpperCase(),
    additionalContext: incidentData.additionalDetails || "",
  };

  const response = await axios.post<APIIncident>(`${API_BASE_URL}/incidents`, payload, {
    headers: { ...getAuthHeader(), "Content-Type": "application/json" },
  });

  return transformAPIIncident(response.data);
};

// 🔷 Update incident status
export const updateIncidentStatus = async (id: string, status: IncidentStatus): Promise<void> => {
  await axios.put(`${API_BASE_URL}/incidents/${id}/status`, { status }, { headers: getAuthHeader() });
};

// 🔷 Assign incident
export const assignIncident = async (id: string, userId: string): Promise<void> => {
  await axios.put(`${API_BASE_URL}/incidents/${id}/assign`, { userId }, { headers: getAuthHeader() });
};

// 🔷 Escalate incident
export const escalateIncident = async (id: string): Promise<void> => {
  await axios.put(`${API_BASE_URL}/incidents/${id}/escalate`, {}, { headers: getAuthHeader() });
};

// 🔷 Add note to incident
export const addNoteToIncident = async (incidentId: string, note: Note): Promise<Note> => {
  const response = await axios.post<Note>(`${API_BASE_URL}/incidents/${incidentId}/notes`, note, {
    headers: getAuthHeader(),
  });
  return response.data; // ✅ ensure Note is returned
};

// 🔷 Get facilities
export const getFacilities = async (): Promise<string[]> => {
  const response = await axios.get<string[]>(`${API_BASE_URL}/incidents/facilities`, {
    headers: getAuthHeader(),
  });
  return response.data;
};