import axios from "axios";
import {
  Incident,
  IncidentStatus,
  IncidentPriority,
  AlertType,
  Note,
} from "../types";

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

// ✅ Define form data type
export type IncidentFormData = {
  title: string;
  description: string;
  location: string;
  priority: IncidentPriority;
  alertType: AlertType;
  additionalDetails?: string;
};

// ✅ Helper mapper function with assignedTo & reportedBy mapping
function mapApiIncident(api: APIIncident): Incident {
  return {
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
    updatedAt: api.updatedAt
      ? new Date(api.updatedAt)
      : new Date(api.createdAt),
    description: api.description || "No description provided",
    slaDeadline: api.slaDeadline ? new Date(api.slaDeadline) : new Date(),
    notes: [],
    escalationLevel: 0,
    acknowledgedAt: undefined,
    resolvedAt: undefined,
    closedAt: undefined,
  };
}

// ✅ Get all incidents
export const getAllIncidents = async (): Promise<Incident[]> => {
  const response = await axios.get<{ data: APIIncident[] }>(
    `${API_BASE_URL}/incidents`,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data.data.map(mapApiIncident);
};

// ✅ Get specific incident by ID
export const getIncidentById = async (id: string): Promise<Incident> => {
  const response = await axios.get<APIIncident>(
    `${API_BASE_URL}/incidents/${id}`,
    {
      headers: getAuthHeader(),
    }
  );
  return mapApiIncident(response.data);
};

// ✅ Create new incident
export const createIncident = async (
  incidentData: IncidentFormData
): Promise<Incident> => {
  const payload = {
    title: incidentData.title,
    description: incidentData.description,
    facility: incidentData.location,
    location: incidentData.location,
    priority: incidentData.priority.toUpperCase(),
    alertType: incidentData.alertType.toUpperCase(),
    additionalContext: incidentData.additionalDetails || "",
  };

  const response = await axios.post<APIIncident>(
    `${API_BASE_URL}/incidents`,
    payload,
    {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    }
  );
  return mapApiIncident(response.data);
};

// ✅ Update incident (PATCH/PUT)
export const updateIncident = async (
  id: string,
  data: Partial<IncidentFormData>
): Promise<void> => {
  // Validate required fields if needed
  if (
    !data.title ||
    !data.description ||
    !data.location ||
    !data.priority ||
    !data.alertType
  ) {
    throw new Error("All required fields must be provided");
  }

  const payload = {
    title: data.title,
    description: data.description,
    facility: data.location,
    location: data.location,
    priority: data.priority.toUpperCase(),
    alertType: data.alertType.toUpperCase(),
    additionalContext: data.additionalDetails || "",
  };

  await axios.put(`${API_BASE_URL}/incidents/${id}`, payload, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
  });
};

// ✅ Update incident status
export const updateIncidentStatus = async (
  id: string,
  status: IncidentStatus
): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/incidents/${id}/status`,
    { status },
    {
      headers: getAuthHeader(),
    }
  );
};

// ✅ Assign incident to a user
export const assignIncident = async (
  id: string,
  userId: string
): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/incidents/${id}/assign`,
    { userId },
    {
      headers: getAuthHeader(),
    }
  );
};

// ✅ Delete incident
export const deleteIncident = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/incidents/${id}`, {
    headers: getAuthHeader(),
  });
};

// ✅ Get facilities
export const getFacilities = async (): Promise<string[]> => {
  const response = await axios.get<string[]>(
    `${API_BASE_URL}/incidents/facilities`,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

// ✅ Add note to incident
export const addNoteToIncident = async (
  incidentId: string,
  note: Note
): Promise<Note> => {
  const response = await axios.post<Note>(
    `${API_BASE_URL}/incidents/${incidentId}/notes`,
    note,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

// ✅ Escalate incident
export const escalateIncident = async (id: string): Promise<void> => {
  await axios.put(
    `${API_BASE_URL}/incidents/${id}/escalate`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
};
