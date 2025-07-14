import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import * as IncidentAPI from "../services/IncidentService";
import { fetchUsers } from "../services/userService";
import { Incident, IncidentStatus, Note, User } from "../types";

interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  users: User[];
  loading: boolean;
  error: string | null;
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
  | { type: "EDIT_INCIDENT"; payload: { id: string; updates: Partial<Incident> } }
  | { type: "ADD_NOTE"; payload: { incidentId: string; note: Note } }
  | { type: "ESCALATE_INCIDENT"; payload: { incidentId: string } }
  | { type: "ASSIGN_INCIDENT"; payload: { incidentId: string; user: User } }
  | {
      type: "UPDATE_STATUS";
      payload: { incidentId: string; status: IncidentStatus };
    };

const initialState: IncidentState = {
  incidents: [],
  selectedIncident: null,
  users: [],
  loading: false,
  error: null,
};

// Helper function to map Incident updates to IncidentFormData format
const mapIncidentToFormData = (incident: Partial<Incident>): Partial<IncidentAPI.IncidentFormData> => {
  const formData: Partial<IncidentAPI.IncidentFormData> = {};
  
  if (incident.title !== undefined) {
    formData.title = incident.title;
  }
  
  if (incident.description !== undefined) {
    formData.description = incident.description;
  }
  
  if (incident.location !== undefined) {
    formData.location = incident.location;
  }
  
  if (incident.priority !== undefined) {
    formData.priority = incident.priority;
  }
  
  if (incident.alertType !== undefined) {
    formData.alertType = incident.alertType;
  }
  
  return formData;
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
        error: null
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case "SET_USERS":
      return { ...state, users: action.payload };

    case "SELECT_INCIDENT":
      return { ...state, selectedIncident: action.payload };

    case "UPDATE_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
        selectedIncident: state.selectedIncident?.id === action.payload.id 
          ? action.payload 
          : state.selectedIncident,
      };

    case "ADD_INCIDENT":
      return { ...state, incidents: [action.payload, ...state.incidents] };

    case "DELETE_INCIDENT": {
      return {
        ...state,
        incidents: state.incidents.filter(i => i.id !== action.payload.incidentId),
        selectedIncident: state.selectedIncident?.id === action.payload.incidentId 
          ? null 
          : state.selectedIncident,
      };
    }

    case "EDIT_INCIDENT": {
      const updatedIncident = state.incidents.find(i => i.id === action.payload.id);
      if (!updatedIncident) return state;
      
      const editedIncident = { 
        ...updatedIncident, 
        ...action.payload.updates, 
        updatedAt: new Date() 
      };
      
      return {
        ...state,
        incidents: state.incidents.map(i =>
          i.id === action.payload.id ? editedIncident : i
        ),
        selectedIncident: state.selectedIncident?.id === action.payload.id 
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
              status: i.status === "new" ? "acknowledged" : i.status
            }
          : i
      );
      
      const updatedSelectedIncident = state.selectedIncident?.id === action.payload.incidentId
        ? { 
            ...state.selectedIncident, 
            assignedTo: action.payload.user, 
            updatedAt: new Date(),
            status: state.selectedIncident.status === "new" ? "acknowledged" : state.selectedIncident.status
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
                priority: i.priority === "low" ? "medium" 
                         : i.priority === "medium" ? "high" 
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

const IncidentContext = createContext<{
  state: IncidentState;
  dispatch: React.Dispatch<IncidentAction>;
  createIncident: (data: Partial<Incident>) => Promise<void>;
  updateStatus: (id: string, status: IncidentStatus) => Promise<void>;
  assignIncident: (id: string, userId: string) => Promise<void>;
  editIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  addNote: (incidentId: string, noteContent: string) => Promise<void>;
  escalateIncident: (incidentId: string) => Promise<void>;
} | null>(null);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(incidentReducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const [incidents, users] = await Promise.all([
          IncidentAPI.getAllIncidents(),
          fetchUsers(),
        ]);
        dispatch({ type: "SET_INCIDENTS", payload: incidents });
        dispatch({ type: "SET_USERS", payload: users });
      } catch (error) {
        console.error("Error loading incidents or users", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to load data." });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    fetchData();
  }, []);

  const createIncident = async (data: Partial<Incident>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      // Convert to IncidentFormData format
      const formData: IncidentAPI.IncidentFormData = {
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        priority: data.priority || "medium",
        alertType: data.alertType || "equipment",
        additionalDetails: ""
      };
      
      const incident = await IncidentAPI.createIncident(formData);
      dispatch({ type: "ADD_INCIDENT", payload: incident });
    } catch (error) {
      console.error("Failed to create incident", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to create incident." });
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
    } catch (error) {
      console.error("Failed to update status", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update status." });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const assignIncident = async (id: string, userId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      // Call API to assign incident
      await IncidentAPI.assignIncident(id, userId);
      
      // Get the user object for local state update
      const assignedUser = state.users.find(user => user.id === userId);
      if (!assignedUser) {
        throw new Error("User not found");
      }
      
      // Update local state immediately with proper user object
      dispatch({ 
        type: "ASSIGN_INCIDENT", 
        payload: { incidentId: id, user: assignedUser } 
      });
      
      // Optionally fetch the updated incident from server to ensure consistency
      try {
        const updatedIncident = await IncidentAPI.getIncidentById(id);
        dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });
      } catch (fetchError) {
        console.warn("Failed to fetch updated incident after assignment:", fetchError);
        // Continue with local state update only
      }
      
    } catch (error) {
      console.error("Failed to assign incident", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to assign incident." });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const editIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      // Convert Incident updates to IncidentFormData format
      const formData = mapIncidentToFormData(updates);
      
      // Update local state immediately for better UX
      dispatch({ type: "EDIT_INCIDENT", payload: { id, updates } });
      
      // Call API with properly formatted data
      const updatedIncident = await IncidentAPI.updateIncident(id, formData);
      
      // Update with server response to ensure consistency
      dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });
      
    } catch (error) {
      console.error("Failed to edit incident", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to edit incident." });
      
      // Revert local changes by refetching the incident
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
      
      // Call API to delete incident
      await IncidentAPI.deleteIncident(id);
      
      // Update local state
      dispatch({ type: "DELETE_INCIDENT", payload: { incidentId: id } });
      
    } catch (error) {
      console.error("Failed to delete incident", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to delete incident." });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addNote = async (incidentId: string, noteContent: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await IncidentAPI.addNoteToIncident(incidentId, noteContent);

      const newNote: Note = {
        id: `note-${Date.now()}`,
        content: noteContent,
        author: {
          id: "current-user",
          name: "Current User",
          email: "user@example.com",
          role: 'User'
        },
        createdAt: new Date(),
        type: "user",
        isInternal: false,
      };

      dispatch({ type: "ADD_NOTE", payload: { incidentId, note: newNote } });
    } catch (error) {
      console.error("Failed to add note:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to add note." });
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
    } catch (error) {
      console.error("Failed to escalate incident", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to escalate incident." });
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
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) throw new Error("useIncidents must be used within IncidentProvider");
  return context;
}
