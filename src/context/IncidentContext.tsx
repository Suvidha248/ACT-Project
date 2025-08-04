// ✅ Cleaned & fixed IncidentContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import * as IncidentAPI from "../services/IncidentService";
import { fetchUsers } from "../services/userService";
import { Incident, IncidentStatus, Note, User } from "../types";

interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  users: User[];
  loading: boolean;
  error: string | null;
  currentFacility?: string;
}

type IncidentAction =
  | { type: "SET_INCIDENTS"; payload: Incident[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SELECT_INCIDENT"; payload: Incident | null }
  | { type: "UPDATE_INCIDENT"; payload: Incident }
  | { type: "ADD_INCIDENT"; payload: Incident }
  | { type: "DELETE_INCIDENT"; payload: { incidentId: string } }
  | {
      type: "EDIT_INCIDENT";
      payload: { id: string; updates: Partial<Incident> };
    }
  | { type: "ADD_NOTE"; payload: { incidentId: string; note: Note } }
  | { type: "ESCALATE_INCIDENT"; payload: { incidentId: string } }
  | { type: "ASSIGN_INCIDENT"; payload: { incidentId: string; user: User } }
  | {
      type: "UPDATE_STATUS";
      payload: { incidentId: string; status: IncidentStatus };
    }
  | { type: "SET_CURRENT_FACILITY"; payload: string };

const initialState: IncidentState = {
  incidents: [],
  selectedIncident: null,
  users: [],
  loading: false,
  error: null,
  currentFacility: undefined,
};

function incidentReducer(
  state: IncidentState,
  action: IncidentAction
): IncidentState {
  switch (action.type) {
    case "SET_INCIDENTS":
      return {
        ...state,
        incidents: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "SET_USERS":
      return { ...state, users: action.payload };

    case "SELECT_INCIDENT":
      return { ...state, selectedIncident: action.payload };

    case "SET_CURRENT_FACILITY":
      return { ...state, currentFacility: action.payload };

    case "UPDATE_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
        selectedIncident:
          state.selectedIncident?.id === action.payload.id
            ? action.payload
            : state.selectedIncident,
      };

    case "ADD_INCIDENT":
      return { ...state, incidents: [action.payload, ...state.incidents] };

    case "DELETE_INCIDENT": {
      return {
        ...state,
        incidents: state.incidents.filter(
          (i) => i.id !== action.payload.incidentId
        ),
        selectedIncident:
          state.selectedIncident?.id === action.payload.incidentId
            ? null
            : state.selectedIncident,
      };
    }

    case "EDIT_INCIDENT": {
      const updatedIncident = state.incidents.find(
        (i) => i.id === action.payload.id
      );
      if (!updatedIncident) return state;

      const editedIncident = {
        ...updatedIncident,
        ...action.payload.updates,
        updatedAt: new Date(),
      };

      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.id ? editedIncident : i
        ),
        selectedIncident:
          state.selectedIncident?.id === action.payload.id
            ? editedIncident
            : state.selectedIncident,
      };
    }

    case "ASSIGN_INCIDENT": {
      const updatedIncidents = state.incidents.map((i) =>
        i.id === action.payload.incidentId
          ? {
              ...i,
              assignedTo: action.payload.user,
              updatedAt: new Date(),
              status: i.status === "new" ? "acknowledged" : i.status,
            }
          : i
      );

      const updatedSelectedIncident =
        state.selectedIncident?.id === action.payload.incidentId
          ? {
              ...state.selectedIncident,
              assignedTo: action.payload.user,
              updatedAt: new Date(),
              status:
                state.selectedIncident.status === "new"
                  ? "acknowledged"
                  : state.selectedIncident.status,
            }
          : state.selectedIncident;

      return {
        ...state,
        incidents: updatedIncidents,
        selectedIncident: updatedSelectedIncident,
      };
    }

    case "ADD_NOTE":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.incidentId
            ? {
                ...i,
                notes: [...i.notes, action.payload.note],
                updatedAt: new Date(),
              }
            : i
        ),
      };

    case "UPDATE_STATUS":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.incidentId
            ? { ...i, status: action.payload.status, updatedAt: new Date() }
            : i
        ),
      };

    case "ESCALATE_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.incidentId
            ? {
                ...i,
                escalationLevel: (i.escalationLevel || 0) + 1,
                priority:
                  i.priority === "low"
                    ? "medium"
                    : i.priority === "medium"
                    ? "high"
                    : "critical",
                updatedAt: new Date(),
              }
            : i
        ),
      };

    default:
      return state;
  }
}

interface IncidentContextType {
  state: IncidentState;
  dispatch: React.Dispatch<IncidentAction>;
  createIncident: (data: Partial<Incident>) => Promise<void>;
  updateStatus: (id: string, status: IncidentStatus) => Promise<void>;
  assignIncident: (id: string, userId: string) => Promise<void>;
  editIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  addNote: (incidentId: string, noteContent: string) => Promise<void>;
  escalateIncident: (incidentId: string) => Promise<void>;
  loadIncidentsByFacility: (
    facility?: string,
    additionalFilters?: Partial<IncidentAPI.IncidentFilters>
  ) => Promise<void>;
  refreshIncidents: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | null>(null);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(incidentReducer, initialState);
  const { addNotification } = useNotifications();

  const { user, profile, initialized } = useAuth();

  // Load incidents with facility awareness
  const loadIncidentsByFacility = async (
    facility?: string,
    additionalFilters?: Partial<IncidentAPI.IncidentFilters>
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      if (facility && facility !== "all") {
        // Use the facility-specific function for better filtering
        const result = await IncidentAPI.getFacilityIncidents(
          facility,
          additionalFilters || {}
        );
        dispatch({ type: "SET_INCIDENTS", payload: result.data });
      } else {
        // Fallback to general filtering
        const filters: IncidentAPI.IncidentFilters = {
          facility: facility && facility !== "all" ? facility : undefined,
          page: 0,
          size: 50,
          sortBy: "createdAt",
          sortOrder: "desc",
          ...additionalFilters,
        };

        const result = await IncidentAPI.getFilteredIncidents(filters);
        dispatch({ type: "SET_INCIDENTS", payload: result.data });
      }

      if (facility) {
        dispatch({ type: "SET_CURRENT_FACILITY", payload: facility });
      }
    } catch (error) {
      console.error("Error loading incidents for facility", facility, error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load incidents." });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Refresh current incidents
  const refreshIncidents = async () => {
    await loadIncidentsByFacility(state.currentFacility);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!initialized || !user) {
        console.log("⏳ Waiting for authentication...");
        return;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        
        // Use facility from profile if available
        const facility = profile?.facilityName?.toLowerCase();
        
        const filters: IncidentAPI.IncidentFilters = {
          facility: facility || undefined,
          page: 0,
          size: 50,
          sortBy: "createdAt",
          sortOrder: "desc"
        };

        console.log("🔍 Loading incidents with filters:", filters);
        
        const [incidents, users] = await Promise.all([
          IncidentAPI.getFilteredIncidents(filters), // ← Your service
          fetchUsers(),
        ]);
        
        dispatch({ type: "SET_INCIDENTS", payload: incidents.data });
        dispatch({ type: "SET_USERS", payload: users });
        
        if (facility) {
          dispatch({ type: "SET_CURRENT_FACILITY", payload: facility });
        }
        
        console.log("✅ Incidents loaded:", incidents.data.length);
        
      } catch (error) {
        console.error("❌ Error loading incidents:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to load incidents." });
        toast.error("Failed to load incident data");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchData();
  }, [initialized, user, profile?.facilityName]);

  const createIncident = async (data: Partial<Incident>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const formData: IncidentAPI.IncidentFormData = {
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        priority: data.priority || "medium",
        alertType: data.alertType || "equipment",
        additionalDetails: "",
      };

      const incident = await IncidentAPI.createIncident(formData);
      dispatch({ type: "ADD_INCIDENT", payload: incident });

      // ✅ FIXED: Use valid notification type and handle undefined facility
      await addNotification({
        title: "New Incident Created",
        message: `${incident.title} has been created in ${incident.location}`,
        type: "incident",
        severity: incident.priority as "low" | "medium" | "high" | "critical",
        facility: incident.location || "Unknown",
        incidentId: incident.id,
        isRead: false,
        actionUrl: `/incidents/${incident.id}`,
      });

      toast.success("Incident created successfully");
    } catch (error) {
      console.error("Failed to create incident", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create incident.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateStatus = async (id: string, status: IncidentStatus) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await IncidentAPI.updateIncidentStatus(id, status);
      const updatedIncident = await IncidentAPI.getIncidentById(id);
      dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });

      // ✅ FIXED: Handle undefined facility
      await addNotification({
        title: "Incident Status Updated",
        message: `${
          updatedIncident.title
        } status changed to ${status.toUpperCase()}`,
        type: "incident",
        severity: updatedIncident.priority as
          | "low"
          | "medium"
          | "high"
          | "critical",
        facility: updatedIncident.location || "Unknown",
        incidentId: id,
        isRead: false,
        actionUrl: `/incidents/${id}`,
      });

      toast.success(`Incident status updated to ${status}`);
    } catch (error) {
      console.error("Failed to update status", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update status.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const assignIncident = async (id: string, userId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await IncidentAPI.assignIncident(id, userId);

      const assignedUser = state.users.find((user) => user.id === userId);
      if (!assignedUser) {
        throw new Error("User not found");
      }

      dispatch({
        type: "ASSIGN_INCIDENT",
        payload: { incidentId: id, user: assignedUser },
      });

      const incident = state.incidents.find((inc) => inc.id === id);

      // ✅ FIXED: Use 'incident' type instead of 'assignment' and handle undefined facility
      await addNotification({
        title: "Incident Assigned",
        message: `${incident?.title || "Incident"} has been assigned to ${
          assignedUser.fullName
        }`,
        type: "incident",
        severity:
          (incident?.priority as "low" | "medium" | "high" | "critical") ||
          "medium",
        facility: incident?.location || "Unknown",
        incidentId: id,
        isRead: false,
        actionUrl: `/incidents/${id}`,
      });

      toast.success(`Incident assigned to ${assignedUser.fullName}`);

      try {
        const updatedIncident = await IncidentAPI.getIncidentById(id);
        dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });
      } catch (fetchError) {
        console.warn(
          "Failed to fetch updated incident after assignment:",
          fetchError
        );
      }
    } catch (error) {
      console.error("Failed to assign incident", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign incident.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const editIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "EDIT_INCIDENT", payload: { id, updates } });

      const updatedIncident = await IncidentAPI.updateIncident(id, updates);
      dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });

      // ✅ FIXED: Handle undefined facility
      await addNotification({
        title: "Incident Updated",
        message: `${updatedIncident.title} has been modified`,
        type: "incident",
        severity: updatedIncident.priority as
          | "low"
          | "medium"
          | "high"
          | "critical",
        facility: updatedIncident.location || "Unknown",
        incidentId: id,
        isRead: false,
        actionUrl: `/incidents/${id}`,
      });

      toast.success("Incident updated successfully");
    } catch (error) {
      console.error("Failed to edit incident", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to edit incident.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);

      try {
        const originalIncident = await IncidentAPI.getIncidentById(id);
        dispatch({ type: "UPDATE_INCIDENT", payload: originalIncident });
      } catch (revertError) {
        console.error("Failed to revert incident changes:", revertError);
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const incident = state.incidents.find((inc) => inc.id === id);

      await IncidentAPI.deleteIncident(id);
      dispatch({ type: "DELETE_INCIDENT", payload: { incidentId: id } });

      // ✅ FIXED: Handle undefined facility
      await addNotification({
        title: "Incident Deleted",
        message: `${incident?.title || "Incident"} has been deleted`,
        type: "incident",
        severity: "medium",
        facility: incident?.location || "Unknown",
        incidentId: id,
        isRead: false,
      });

      toast.success("Incident deleted successfully");
    } catch (error) {
      console.error("Failed to delete incident", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete incident.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addNote = async (incidentId: string, noteContent: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const newNote = await IncidentAPI.addNoteToIncident(
        incidentId,
        noteContent
      );
      dispatch({ type: "ADD_NOTE", payload: { incidentId, note: newNote } });

      const incident = state.incidents.find((inc) => inc.id === incidentId);

      // ✅ FIXED: Handle undefined facility
      await addNotification({
        title: "New Note Added",
        message: `A note has been added to ${incident?.title || "incident"}`,
        type: "incident",
        severity: "low",
        facility: incident?.location || "Unknown",
        incidentId: incidentId,
        isRead: false,
        actionUrl: `/incidents/${incidentId}`,
      });

      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add note:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add note.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const escalateIncident = async (incidentId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await IncidentAPI.escalateIncident(incidentId);
      const updatedIncident = await IncidentAPI.getIncidentById(incidentId);
      dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });

      // ✅ FIXED: Use 'incident' type instead of 'escalation' and handle undefined facility
      await addNotification({
        title: "Incident Escalated",
        message: `${updatedIncident.title} has been escalated to level ${updatedIncident.escalationLevel}`,
        type: "incident",
        severity: "high",
        facility: updatedIncident.location || "Unknown",
        incidentId: incidentId,
        isRead: false,
        actionUrl: `/incidents/${incidentId}`,
      });

      toast.warning("Incident escalated successfully");
    } catch (error) {
      console.error("Failed to escalate incident", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to escalate incident.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <IncidentContext.Provider
      value={{
        state,
        dispatch,
        createIncident,
        updateStatus,
        assignIncident,
        editIncident,
        deleteIncident,
        addNote,
        escalateIncident,
        loadIncidentsByFacility,
        refreshIncidents,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

// ✅ FIXED: Moved to separate file to avoid Fast Refresh warning
// Move this to a separate file like 'hooks/useIncidents.ts'
export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context)
    throw new Error("useIncidents must be used within IncidentProvider");
  return context;
}
