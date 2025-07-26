import axios from "axios";
import {
  AlertType,
  Incident,
  IncidentPriority,
  IncidentStatus,
  Note,
  User,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '5000');
const ENABLE_DEBUG = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';

// ✅ FIXED: Updated to match actual API response structure from screenshots
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
  location?: string;
  escalationLevel?: number;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  notesCount?: number;
  assignedTo?: {
    id?: string;
    name: string; // ✅ API uses 'name', not 'fullName'
    role?: string;
    department?: string;
    assignedAt?: {
      seconds?: number;
      nanos?: number;
    };
  };
  reportedBy?: {
    id?: string;
    name: string; // ✅ API uses 'name', not 'fullName'
    role?: string;
  };
  notes?: APINote[];
  additionalContext?: string;
  tags?: string[];
  workOrders?: unknown[];
};

interface UserStorageData {
  id: string;
  fullName: string;
  role: string;
  email: string;
  department?: string;
  group?: string;
  facilityName?: string;
  uid?: string;
  displayName?: string;
}

type APINote = {
  id: string;
  content: string;
  author: {
    id: string;
    name: string; // ✅ API uses 'name', not 'fullName'
    role?: string;
  };
  createdAt: string;
  type?: string;
  internal?: boolean; // ✅ API uses 'internal', not 'isInternal'
};

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

interface AxiosErrorType {
  response?: {
    status: number;
    data?: { message?: string };
  };
  message: string;
  request?: unknown;
  config?: {
    url?: string;
    method?: string;
  };
}

// Helper function to convert Date to Firestore timestamp format
function dateToFirestoreTimestamp(date: Date): { seconds: number; nanos: number } {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanos = (date.getTime() % 1000) * 1000000;
  return { seconds, nanos };
}

const getAuthHeader = () => {
  const token = sessionStorage.getItem("idToken");
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };
};

const debugLog = (message: string, data?: unknown) => {
  if (ENABLE_DEBUG) {
    console.log(`[ACT Debug] ${message}`, data);
  }
};

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
            fullName: user.fullName || user.displayName || 'Unknown User',
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
    fullName: 'System User',
    role: 'User',
    email: 'system@company.com',
    department: 'General',
    group: 'System',
    facilityName: undefined
  };
};

export const saveUserToStorage = (user: Partial<UserStorageData> & { uid?: string; facilityName?: string }): void => {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

export type IncidentFormData = {
  title: string;
  description: string;
  location: string;
  priority: IncidentPriority;
  alertType: AlertType;
  additionalDetails?: string;
};

// ✅ FIXED: Enhanced user creation function
function createUserFromApi(
  apiUser: { 
    id?: string; 
    name: string; // ✅ Now correctly expecting 'name'
    role?: string; 
    department?: string;
  }, 
  facility?: string
): User {
  const now = new Date();
  const userId = apiUser.id || `unknown_${Date.now()}`;
  
  return {
    id: userId,
    fullName: apiUser.name, // ✅ Map 'name' to 'fullName'
    username: apiUser.name.toLowerCase().replace(/\s+/g, ''),
    email: "no-email@example.com", // You might want to add email to your API
    role: apiUser.role || 'User',
    department: apiUser.department || "General",
    group: "General", // Add group to your API if needed
    facilityName: facility || "",
    isActive: true,
    createdAt: dateToFirestoreTimestamp(now),
    updatedAt: dateToFirestoreTimestamp(now),
    displayName: apiUser.name,
    uid: userId,
    createdAtAsTimestamp: dateToFirestoreTimestamp(now),
    updatedAtAsTimestamp: dateToFirestoreTimestamp(now),
  };
}

function createSystemUser(): User {
  const now = new Date();
  
  return {
    id: "system",
    fullName: "System",
    username: "system",
    email: "system@example.com",
    role: "admin",
    department: "General",
    group: "System",
    facilityName: "",
    isActive: true,
    createdAt: dateToFirestoreTimestamp(now),
    updatedAt: dateToFirestoreTimestamp(now),
    displayName: "System",
    uid: "system",
    createdAtAsTimestamp: dateToFirestoreTimestamp(now),
    updatedAtAsTimestamp: dateToFirestoreTimestamp(now),
  };
}

// ✅ FIXED: Complete mapping function with comprehensive error handling
function mapApiIncident(api: APIIncident): Incident {
  // Helper function to safely convert strings to lowercase
  const safeToLowerCase = (value: string | undefined | null): string => {
    if (!value || typeof value !== 'string') {
      return '';
    }
    return value.toLowerCase();
  };

  // Helper function to safely parse dates
  const parseDate = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  };

  console.log('🔄 Mapping API incident:', api);

  // Validate required fields
  if (!api.id) {
    throw new Error('API incident missing required id field');
  }

  const result: Incident = {
    id: api.id,
    title: api.title || "Untitled Incident",
    
    status: (safeToLowerCase(api.status) as IncidentStatus) || "new",
    priority: (safeToLowerCase(api.priority) as IncidentPriority) || "medium", 
    
    location: api.location || api.facility || "Unknown Location",
    alertType: (safeToLowerCase(api.alertType) as AlertType) || "equipment",
    
    assignedTo: api.assignedTo ? createUserFromApi({
      id: api.assignedTo.id,
      name: api.assignedTo.name,
      role: api.assignedTo.role,
      department: api.assignedTo.department
    }, api.facility || api.location) : undefined,
    
    reportedBy: api.reportedBy ? createUserFromApi({
      id: api.reportedBy.id,
      name: api.reportedBy.name,
      role: api.reportedBy.role,
    }, api.facility || api.location) : createSystemUser(),
    
    createdAt: parseDate(api.createdAt) || new Date(),
    updatedAt: parseDate(api.updatedAt) || parseDate(api.createdAt) || new Date(),
    
    description: api.description || "No description provided",
    slaDeadline: parseDate(api.slaDeadline),
    notes: Array.isArray(api.notes) ? api.notes.map(mapApiNote) : [],
    escalationLevel: typeof api.escalationLevel === 'number' ? api.escalationLevel : 0,
    
    // ✅ CRITICAL FIX: Add notesCount mapping
    notesCount: typeof api.notesCount === 'number' ? api.notesCount : undefined,
    
    acknowledgedAt: parseDate(api.acknowledgedAt),
    resolvedAt: parseDate(api.resolvedAt),
    closedAt: parseDate(api.closedAt),
  };

  // ✅ ENHANCED: Debug logging for notesCount
  console.log('✅ Successfully mapped incident:', {
    id: result.id,
    notesCount: result.notesCount,
    apiNotesCount: api.notesCount
  });
  
  return result;
}

function mapApiNote(apiNote: APINote): Note {
  return {
    id: apiNote.id,
    content: apiNote.content,
    author: {
      id: apiNote.author.id,
      fullName: apiNote.author.name, // ✅ Map 'name' to 'fullName'
      email: "user@example.com", // Add email to your API if available
      role: apiNote.author.role || 'User'
    },
    createdAt: new Date(apiNote.createdAt),
    type: (apiNote.type as Note['type']) || "user",
    isInternal: apiNote.internal || false, // ✅ Map 'internal' to 'isInternal'
  };
}

// Enhanced error handling
async function handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    console.error('🚨 API Call Error:', error);
    
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      'request' in error &&
      'config' in error
    ) {
      const axiosError = error as AxiosErrorType;
      const status = axiosError.response?.status;
      const errorData = axiosError.response?.data;
      
      debugLog('API Error Details:', {
        status,
        data: errorData,
        url: axiosError.config?.url,
        method: axiosError.config?.method
      });
      
      if (status === 401) {
        sessionStorage.removeItem("idToken");
        throw new Error("Authentication expired. Please log in again.");
      } else if (status === 403) {
        throw new Error("Access denied. You don't have permission for this action.");
      } else if (status === 404) {
        throw new Error("Resource not found.");
      } else if (status === 500) {
        const serverMessage = errorData?.message || "Internal server error";
        throw new Error(`Server error: ${serverMessage}`);
      } else if (status && status >= 400) {
        const errorMessage = errorData?.message || axiosError.message || "An error occurred.";
        throw new Error(`Request failed (${status}): ${errorMessage}`);
      } else {
        const errorMessage = errorData?.message || axiosError.message || "An error occurred.";
        throw new Error(errorMessage);
      }
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred.");
  }
}

// ✅ ENHANCED: getIncidentById with comprehensive error handling
export const getIncidentById = async (id: string): Promise<Incident> => {
  if (!id || !id.trim()) {
    throw new Error("Incident ID is required");
  }

  return handleApiCall(async () => {
    const url = `${API_BASE_URL}/incidents/${encodeURIComponent(id)}`;
    debugLog("🔍 Fetching incident by ID:", { id, url });
    
    try {
      const response = await axios.get<APIIncident>(
        url,
        {
          headers: getAuthHeader(),
          timeout: API_TIMEOUT,
        }
      );
      
      console.log("✅ Raw API Response:", JSON.stringify(response.data, null, 2));
      
      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error("Invalid response format from server");
      }
      
      if (!response.data.id) {
        throw new Error("Response missing required 'id' field");
      }
      
      // Map the incident with error handling
      try {
        const mappedIncident = mapApiIncident(response.data);
        console.log("✅ Successfully mapped incident:", mappedIncident);
        return mappedIncident;
      } catch (mappingError) {
        console.error("❌ Error mapping incident:", mappingError);
        console.error("❌ Raw API data that failed mapping:", JSON.stringify(response.data, null, 2));
        
        // Provide more specific error information
        if (mappingError instanceof Error) {
          throw new Error(`Failed to process incident data: ${mappingError.message}`);
        } else {
          throw new Error('Failed to process incident data: Unknown mapping error');
        }
      }
      
    } catch (axiosError: unknown) {
      if (
        axiosError &&
        typeof axiosError === 'object' &&
        'response' in axiosError
      ) {
        const errorResponse = axiosError as { response?: { status?: number; data?: unknown } };
        if (errorResponse.response?.status === 500) {
          debugLog("🚨 Server error when fetching incident:", {
            id,
            status: errorResponse.response.status,
            data: errorResponse.response.data
          });
          throw new Error(`Server error while fetching incident. Please try again later.`);
        }
      }
      throw axiosError;
    }
  });
};

// Facility-only incident retrieval
export const getFacilityIncidents = async (
  facility: string,
  additionalFilters: Omit<IncidentFilters, 'facility'> = {}
): Promise<FilteredIncidentResponse> => {
  if (!facility || facility === 'all') {
    throw new Error('getFacilityIncidents requires a valid facility identifier');
  }

  return handleApiCall(async () => {
    const params = new URLSearchParams();
    params.append('facility', facility);
    
    Object.entries(additionalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        params.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/incidents?${params.toString()}`;
    debugLog("🔗 Fetching facility incidents:", { facility, url });
    
    const response = await axios.get<{ data: APIIncident[]; total: number }>(
      url,
      {
        headers: getAuthHeader(),
        timeout: API_TIMEOUT
      }
    );

    debugLog("📦 API Response:", response.data);
    const apiIncidents = response.data.data || [];
    const transformedIncidents = apiIncidents.map(mapApiIncident);

    return {
      data: transformedIncidents,
      total: response.data.total || transformedIncidents.length,
      page: additionalFilters.page,
      size: additionalFilters.size,
    };
  });
};

// General filtering function (for backward compatibility)
export const getFilteredIncidents = async (
  filters: IncidentFilters = {}
): Promise<FilteredIncidentResponse> => {
  return handleApiCall(async () => {
    const params = new URLSearchParams();
    
    if (filters.facility && filters.facility !== "all") {
      params.append("facility", filters.facility);
      debugLog(`Adding facility filter: ${filters.facility}`);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'facility' && value !== undefined && value !== null && value !== "all") {
        params.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/incidents?${params.toString()}`;
    debugLog("🔗 Fetching filtered incidents:", url);
    
    const response = await axios.get<{ data: APIIncident[]; total: number }>(
      url,
      {
        headers: getAuthHeader(),
        timeout: API_TIMEOUT
      }
    );

    // ✅ ENHANCED: Debug notesCount specifically
    console.log("📦 Raw API Response:", response.data);
    console.log("📊 NotesCount debug:", response.data.data?.map(i => ({
      id: i.id,
      notesCount: i.notesCount,
      notesCountType: typeof i.notesCount
    })));

    const apiIncidents = response.data.data || [];
    const transformedIncidents = apiIncidents.map(mapApiIncident);

    // ✅ ENHANCED: Debug transformed data
    console.log("🔄 Transformed incidents notesCount:", transformedIncidents.map(i => ({
      id: i.id,
      notesCount: i.notesCount,
      notesCountType: typeof i.notesCount
    })));

    return {
      data: transformedIncidents,
      total: response.data.total || transformedIncidents.length,
      page: filters.page,
      size: filters.size,
    };
  });
};


export const createIncident = async (
  incidentData: IncidentFormData
): Promise<Incident> => {
  return handleApiCall(async () => {
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

    debugLog("Creating incident with payload:", payload);

    const response = await axios.post<APIIncident>(
      `${API_BASE_URL}/incidents`,
      payload,
      {
        headers: getAuthHeader(),
        timeout: API_TIMEOUT
      }
    );
    return mapApiIncident(response.data);
  });
};

export const updateIncident = async (
  id: string,
  updates: Partial<Incident>
): Promise<Incident> => {
  return handleApiCall(async () => {
    const payload: Record<string, unknown> = {};
    
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

    debugLog("Updating incident with payload:", { id, payload });

    const response = await axios.put<APIIncident>(
      `${API_BASE_URL}/incidents/${id}`,
      payload,
      {
        headers: getAuthHeader(),
        timeout: API_TIMEOUT
      }
    );
    return mapApiIncident(response.data);
  });
};

export const updateIncidentStatus = async (id: string, status: IncidentStatus): Promise<void> => {
  return handleApiCall(async () => {
    debugLog("Updating incident status:", { id, status });
    await axios.put(
      `${API_BASE_URL}/incidents/${id}`,
      { status: status.toUpperCase() },
      { headers: getAuthHeader(), timeout: API_TIMEOUT }
    );
  });
};

export const assignIncident = async (id: string, userId: string): Promise<void> => {
  return handleApiCall(async () => {
    if (!userId?.trim()) {
      throw new Error("User ID is required");
    }

    const payload = {
      userId,                        // ← required by your DTO
      // assignmentNote: "foo",     // ← optional
      // priority: "high"           // ← optional
    };

    debugLog("Assigning incident:", { id, payload });

    await axios.put(
      `${API_BASE_URL}/incidents/${id}/assign`,
      payload,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        },
        timeout: API_TIMEOUT
      }
    );
  });
};


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

export const escalateIncident = async (id: string): Promise<void> => {
  return handleApiCall(async () => {
    debugLog("Escalating incident:", { id });
    await axios.put(
      `${API_BASE_URL}/incidents/${id}/escalate`,
      { escalationReason: "Manual escalation requested" },
      { headers: getAuthHeader(), timeout: API_TIMEOUT }
    );
  });
};

export const deleteIncident = async (id: string): Promise<void> => {
  return handleApiCall(async () => {
    debugLog("Deleting incident:", { id });
    await axios.delete(`${API_BASE_URL}/incidents/${id}`, {
      headers: getAuthHeader(),
      timeout: API_TIMEOUT
    });
  });
};
