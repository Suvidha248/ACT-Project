// src/services/IncidentService.tsx
import axios from "axios";
import {
  AlertType,
  Incident,
  IncidentPriority,
  IncidentStatus,
  User,
} from "../types";

const API_BASE_URL = "http://localhost:8080/api";

type IncidentApiResponse = {
  total: number;
  data: APIIncident[];
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

// Enhanced filtering interface
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

// Transform API incident to frontend Incident type
// In IncidentService.tsx
const transformAPIIncident = (apiIncident: APIIncident): Incident => ({
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
  notes: [], // ✅ Empty array of properly typed Notes
  escalationLevel: 0,
  acknowledgedAt: undefined,
  resolvedAt: undefined,
  closedAt: undefined,
  assignedTo: undefined,
});


// Get all incidents (existing function)
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

  const apiIncidents = response.data.data;
  return apiIncidents.map(transformAPIIncident);
};

// NEW: Get filtered incidents with server-side filtering and pagination
export const getFilteredIncidents = async (filters: IncidentFilters = {}): Promise<FilteredIncidentResponse> => {
  const token = sessionStorage.getItem("idToken") || "";
  
  const params = new URLSearchParams();
  
  // Add filters to query params
  if (filters.facility && filters.facility !== 'all') {
    params.append("facility", filters.facility);
  }
  if (filters.status && filters.status !== 'all') {
    params.append("status", filters.status);
  }
  if (filters.priority && filters.priority !== 'all') {
    params.append("priority", filters.priority);
  }
  if (filters.page !== undefined) {
    params.append("page", filters.page.toString());
  }
  if (filters.size !== undefined) {
    params.append("size", filters.size.toString());
  }

  console.log("🔗 Fetching filtered incidents:", `${API_BASE_URL}/incidents?${params.toString()}`);

  const response = await axios.get<IncidentApiResponse>(
    `${API_BASE_URL}/incidents?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log("📦 API Response:", response.data);

  const apiIncidents = response.data.data;
  const transformedIncidents = apiIncidents.map(transformAPIIncident);

  return {
    data: transformedIncidents,
    total: response.data.total || transformedIncidents.length
  };
};

// Get single incident by ID
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

  return transformAPIIncident(response.data);
};

// Create new incident
export const createIncident = async (
  incidentData: Partial<Incident>
): Promise<Incident> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await axios.post<APIIncident>(
    `${API_BASE_URL}/incidents`,
    {
      title: incidentData.title,
      description: incidentData.description,
      priority: incidentData.priority,
      facility: incidentData.location,
      alertType: incidentData.alertType
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return transformAPIIncident(response.data);
};

// Update incident status
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

// Assign incident to user
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

// Get available facilities
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
