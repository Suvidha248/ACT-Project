import axios from "axios";
import {
  AlertType,
  Incident,
  IncidentPriority,
  IncidentStatus,
  Note,
  User,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '5000');
const ENABLE_DEBUG = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';

// API Response Types
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
  escalationLevel?: number;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedTo?: {
    id: string;
    name: string;
    email?: string;
    role: string;
    department: string;
    group?: string;
  };
  reportedBy?: {
    id: string;
    name: string;
    email?: string;
    role: string;
    department?: string;
    group?: string;
  };
  notes?: APINote[];
};

interface UserStorageData {
  id: string;
  name: string;
  role: string;
  email: string;
  department?: string;
  group?: string;
  facilityName?: string;
  uid?: string;
  fullName?: string;
  displayName?: string;
}

type APINote = {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email?: string;
    role?: string; // ✅ Added role to API type
  };
  createdAt: string;
  type?: string;
  isInternal?: boolean;
};

// Enhanced filtering interface
export interface IncidentFilters {
  facility?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  reportedBy?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilteredIncidentResponse {
  data: Incident[];
  total: number;
  page?: number;
  size?: number;
}

// Define a proper interface for axios errors
interface AxiosErrorType {
  response?: {
    status: number;
    data?: { message?: string };
  };
  message: string;
  request?: unknown;
  config?: unknown;
}

// Enhanced auth header with error handling
const getAuthHeader = () => {
  const token = sessionStorage.getItem("idToken");
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Debug logging utility
const debugLog = (message: string, data?: unknown) => {
  if (ENABLE_DEBUG) {
    console.log(`[ACT Debug] ${message}`, data);
  }
};

// ✅ Fixed: Utility function to get user from storage (no React hooks)
export const getCurrentUserFromStorage = (): UserStorageData => {
  try {
    const sources = [
      () => localStorage.getItem('currentUser'),
      () => sessionStorage.getItem('currentUser'),
      () => localStorage.getItem('user'),
      () => sessionStorage.getItem('user')
    ];

    for (const getSource of sources) {
      const stored = getSource();
      if (stored) {
        const user = JSON.parse(stored) as UserStorageData;
        if (user && user.id) {
          return {
            id: user.id,
            name: user.name || user.fullName || user.displayName || 'Unknown User',
            role: user.role || 'User',
            email: user.email || 'user@company.com',
            department: user.department || 'General',
            group: user.group || 'System',
            facilityName: user.facilityName
          };
        }
      }
    }
  } catch (error) {
    console.error('Error parsing user from storage:', error);
  }

  return {
    id: 'system',
    name: 'System User',
    role: 'User',
    email: 'system@company.com',
    department: 'General',
    group: 'System',
    facilityName: undefined
  };
};

// ✅ Fixed: Save user to storage utility
export const saveUserToStorage = (user: Partial<User> & { uid?: string; facilityName?: string }): void => {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

// Define form data type
export type IncidentFormData = {
  title: string;
  description: string;
  location: string;
  priority: IncidentPriority;
  alertType: AlertType;
  additionalDetails?: string;
};

// Enhanced mapper function with better error handling and type safety
function mapApiIncident(api: APIIncident): Incident {
  return {
    id: api.id,
    title: api.title,
    status: api.status.toLowerCase() as IncidentStatus,
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
          group: api.assignedTo.group || "General",
        } as User
      : undefined,
    reportedBy: api.reportedBy
      ? {
          id: api.reportedBy.id,
          name: api.reportedBy.name,
          email: api.reportedBy.email || "system@example.com",
          role: api.reportedBy.role,
          department: api.reportedBy.department || "General",
          group: api.reportedBy.group || "System",
        } as User
      : {
          id: "system",
          name: "System",
          email: "system@example.com",
          role: "admin",
          department: "General",
          group: "System",
        } as User,
    createdAt: new Date(api.createdAt),
    updatedAt: api.updatedAt ? new Date(api.updatedAt) : new Date(api.createdAt),
    description: api.description || "No description provided",
    slaDeadline: api.slaDeadline ? new Date(api.slaDeadline) : new Date(),
    notes: api.notes?.map(mapApiNote) || [],
    escalationLevel: api.escalationLevel || 0,
    acknowledgedAt: api.acknowledgedAt ? new Date(api.acknowledgedAt) : undefined,
    resolvedAt: api.resolvedAt ? new Date(api.resolvedAt) : undefined,
    closedAt: api.closedAt ? new Date(api.closedAt) : undefined,
  };
}

// ✅ Fixed: Helper function to map API notes with proper user handling
function mapApiNote(apiNote: APINote): Note {
  const defaultUser = getCurrentUserFromStorage();
  
  return {
    id: apiNote.id,
    content: apiNote.content,
    author: {
      id: apiNote.author.id,
      name: apiNote.author.name,
      email: apiNote.author.email || "user@example.com",
      role: apiNote.author.role || defaultUser.role || 'User' // ✅ Fixed: Use role from API or fallback
    },
    createdAt: new Date(apiNote.createdAt),
    type: (apiNote.type as Note['type']) || "user",
    isInternal: apiNote.isInternal || false,
  };
}

// Alternative error checking without relying on axios.isAxiosError
async function handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    // Check if it's an axios error by examining its properties
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      'request' in error &&
      'config' in error
    ) {
      // This is an axios error
      const axiosError = error as AxiosErrorType;
      
      if (axiosError.response?.status === 401) {
        sessionStorage.removeItem("idToken");
        throw new Error("Authentication expired. Please log in again.");
      } else if (axiosError.response?.status === 403) {
        throw new Error("Access denied. You don't have permission for this action.");
      } else if (axiosError.response?.status === 404) {
        throw new Error("Resource not found.");
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        const errorMessage = axiosError.response?.data?.message || axiosError.message || "An error occurred.";
        throw new Error(errorMessage);
      }
    }
    
    // Handle non-Axios errors
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle unknown errors
    throw new Error("An unexpected error occurred.");
  }
}

// Get all incidents (legacy support)
export const getAllIncidents = async (): Promise<Incident[]> => {
  return handleApiCall(async () => {
    const response = await axios.get<{ data: APIIncident[] }>(
      `${API_BASE_URL}/incidents`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data.data.map(mapApiIncident);
  });
};

// Enhanced filtered incidents with better parameter handling
export const getFilteredIncidents = async (
  filters: IncidentFilters = {}
): Promise<FilteredIncidentResponse> => {
  return handleApiCall(async () => {
    const params = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all") {
        params.append(key, value.toString());
      }
    });

    console.log("🔗 Fetching filtered incidents:", `${API_BASE_URL}/incidents?${params.toString()}`);

    const response = await axios.get<IncidentApiResponse>(
      `${API_BASE_URL}/incidents?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    console.log("📦 API Response:", response.data);

    const apiIncidents = response.data.data;
    const transformedIncidents = apiIncidents.map(mapApiIncident);

    return {
      data: transformedIncidents,
      total: response.data.total || transformedIncidents.length,
      page: filters.page,
      size: filters.size,
    };
  });
};

// Get specific incident by ID
export const getIncidentById = async (id: string): Promise<Incident> => {
  return handleApiCall(async () => {
    const response = await axios.get<APIIncident>(
      `${API_BASE_URL}/incidents/${id}`,
      {
        headers: getAuthHeader(),
      }
    );
    return mapApiIncident(response.data);
  });
};

// Create new incident with enhanced validation
export const createIncident = async (
  incidentData: IncidentFormData
): Promise<Incident> => {
  return handleApiCall(async () => {
    // Validate required fields
    if (!incidentData.title?.trim()) {
      throw new Error("Title is required");
    }
    if (!incidentData.description?.trim()) {
      throw new Error("Description is required");
    }
    if (!incidentData.location?.trim()) {
      throw new Error("Location is required");
    }

    const payload = {
      title: incidentData.title.trim(),
      description: incidentData.description.trim(),
      facility: incidentData.location,
      location: incidentData.location,
      priority: incidentData.priority.toUpperCase(),
      alertType: incidentData.alertType.toUpperCase(),
      additionalContext: incidentData.additionalDetails?.trim() || "",
    };

    const response = await axios.post<APIIncident>(
      `${API_BASE_URL}/incidents`,
      payload,
      {
        headers: getAuthHeader(),
      }
    );
    return mapApiIncident(response.data);
  });
};

// Enhanced update incident with better validation
export const updateIncident = async (
  id: string,
  updates: Partial<Incident>
): Promise<Incident> => {
  return handleApiCall(async () => {
    // Build payload from Incident properties
    const payload: Record<string, string | undefined> = {};
    
    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        throw new Error("Title cannot be empty");
      }
      payload.title = updates.title.trim();
    }
    
    if (updates.description !== undefined) {
      if (!updates.description.trim()) {
        throw new Error("Description cannot be empty");
      }
      payload.description = updates.description.trim();
    }
    
    if (updates.location !== undefined) {
      if (!updates.location.trim()) {
        throw new Error("Location cannot be empty");
      }
      payload.facility = updates.location;
      payload.location = updates.location;
    }
    
    if (updates.priority !== undefined) {
      payload.priority = updates.priority.toUpperCase();
    }
    
    if (updates.alertType !== undefined) {
      payload.alertType = updates.alertType.toUpperCase();
    }

    const response = await axios.put<APIIncident>(
      `${API_BASE_URL}/incidents/${id}`,
      payload,
      {
        headers: getAuthHeader(),
      }
    );
    
    return mapApiIncident(response.data);
  });
};

// Update incident status
export const updateIncidentStatus = async (
  id: string,
  status: IncidentStatus
): Promise<void> => {
  return handleApiCall(async () => {
    await axios.put(
      `${API_BASE_URL}/incidents/${id}/status`,
      { status: status.toUpperCase() },
      {
        headers: getAuthHeader(),
      }
    );
  });
};

// Assign incident to a user
export const assignIncident = async (
  id: string,
  userId: string
): Promise<void> => {
  return handleApiCall(async () => {
    if (!userId?.trim()) {
      throw new Error("User ID is required");
    }
    
    await axios.put(
      `${API_BASE_URL}/incidents/${id}/assign`,
      { userId },
      {
        headers: getAuthHeader(),
      }
    );
  });
};

// Delete incident
export const deleteIncident = async (id: string): Promise<void> => {
  return handleApiCall(async () => {
    await axios.delete(`${API_BASE_URL}/incidents/${id}`, {
      headers: getAuthHeader(),
    });
  });
};

// Get facilities
export const getFacilities = async (): Promise<string[]> => {
  return handleApiCall(async () => {
    const response = await axios.get<string[]>(
      `${API_BASE_URL}/incidents/facilities`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  });
};

// Enhanced add note function with proper parameter handling
export const addNoteToIncident = async (
  incidentId: string,
  noteContent: string
): Promise<Note> => {
  return handleApiCall(async () => {
    debugLog('Adding note to incident', { incidentId, contentLength: noteContent.length });
    
    const response = await axios.post<APINote>(
      `${API_BASE_URL}/incidents/${incidentId}/notes`,
      {
        content: noteContent.trim(),
        type: "user",
        isInternal: false,
      },
      {
        headers: getAuthHeader(),
        timeout: API_TIMEOUT
      }
    );
    
    debugLog('Note added successfully', response.data);
    return mapApiNote(response.data);
  });
};

// Get notes for an incident
export const getIncidentNotes = async (incidentId: string): Promise<Note[]> => {
  return handleApiCall(async () => {
    const response = await axios.get<APINote[]>(
      `${API_BASE_URL}/incidents/${incidentId}/notes`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data.map(mapApiNote);
  });
};

// Escalate incident
export const escalateIncident = async (id: string): Promise<void> => {
  return handleApiCall(async () => {
    await axios.put(
      `${API_BASE_URL}/incidents/${id}/escalate`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
  });
};

// Define the stats interface
interface IncidentStats {
  total: number;
  new: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
}

// Get incident statistics
export const getIncidentStats = async (facility?: string): Promise<IncidentStats> => {
  return handleApiCall(async () => {
    const params = new URLSearchParams();
    if (facility && facility !== "all") {
      params.append("facility", facility);
    }

    const response = await axios.get<IncidentStats>(
      `${API_BASE_URL}/incidents/stats?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );
    
    // Ensure the response matches the expected type
    return response.data as IncidentStats;
  });
};

// Bulk operations
export const bulkUpdateIncidents = async (
  incidentIds: string[],
  updates: Partial<{
    status: IncidentStatus;
    priority: IncidentPriority;
    assignedTo: string;
  }>
): Promise<void> => {
  return handleApiCall(async () => {
    await axios.put(
      `${API_BASE_URL}/incidents/bulk`,
      {
        incidentIds,
        updates,
      },
      {
        headers: getAuthHeader(),
      }
    );
  });
};

// Search incidents
export const searchIncidents = async (
  query: string,
  filters?: Partial<IncidentFilters>
): Promise<FilteredIncidentResponse> => {
  return handleApiCall(async () => {
    const params = new URLSearchParams();
    params.append("q", query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "all") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await axios.get<IncidentApiResponse>(
      `${API_BASE_URL}/incidents/search?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return {
      data: response.data.data.map(mapApiIncident),
      total: response.data.total,
    };
  });
};
