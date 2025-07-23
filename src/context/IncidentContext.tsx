// ✅ Cleaned & fixed IncidentContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Incident, IncidentStatus, User, Note } from "../types";
import * as IncidentAPI from "../services/IncidentService";
import { getAllUsers } from "../services/userService";
import { IncidentFormData } from "../services/IncidentService";

interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  users: User[];
}

type IncidentAction =
  | { type: "SET_INCIDENTS"; payload: Incident[] }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SELECT_INCIDENT"; payload: Incident | null }
  | { type: "UPDATE_INCIDENT"; payload: Incident }
  | { type: "ADD_INCIDENT"; payload: Incident }
  | { type: "ADD_NOTE"; payload: { incidentId: string; note: Note } }
  | { type: "ESCALATE_INCIDENT"; payload: { incidentId: string } }
  | {
      type: "UPDATE_STATUS";
      payload: { incidentId: string; status: IncidentStatus };
    };

const initialState: IncidentState = {
  incidents: [],
  selectedIncident: null,
  users: [],
};

function incidentReducer(
  state: IncidentState,
  action: IncidentAction
): IncidentState {
  switch (action.type) {
    case "SET_INCIDENTS":
      return { ...state, incidents: action.payload };
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
      };
    case "ADD_INCIDENT":
      return { ...state, incidents: [action.payload, ...state.incidents] };
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
  addNote: (incidentId: string, note: Note) => Promise<void>;
  escalateIncident: (incidentId: string) => Promise<void>;
} | null>(null);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(incidentReducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidents, users] = await Promise.all([
          IncidentAPI.getAllIncidents(),
          getAllUsers(),
        ]);
        dispatch({ type: "SET_INCIDENTS", payload: incidents });
        dispatch({ type: "SET_USERS", payload: users });
      } catch (error) {
        console.error("Error loading incidents or users", error);
      }
    };

    if (state.incidents.length === 0 && state.users.length === 0) {
      fetchData();
    }
  }, [state.incidents.length, state.users.length]);

  const createIncident = async (data: Partial<Incident>) => {
    const form: IncidentFormData = {
      title: data.title || "Untitled",
      description: data.description || "No description provided",
      location: data.location || "Unknown",
      priority: data.priority || "low",
      alertType: data.alertType || "equipment",
      additionalDetails: data.additionalContext || "",
    };

    const incident = await IncidentAPI.createIncident(form);
    dispatch({ type: "ADD_INCIDENT", payload: incident });
  };

  const updateStatus = async (id: string, status: IncidentStatus) => {
    await IncidentAPI.updateIncidentStatus(id, status);
    const updatedIncident = await IncidentAPI.getIncidentById(id);
    dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });
  };

  const assignIncident = async (id: string, userId: string) => {
    await IncidentAPI.assignIncident(id, userId);
    const updatedIncident = await IncidentAPI.getIncidentById(id);
    dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });
  };

  const addNote = async (incidentId: string, note: Note) => {
    const savedNote = await IncidentAPI.addNoteToIncident(incidentId, note);
    dispatch({ type: "ADD_NOTE", payload: { incidentId, note: savedNote } });
  };

  const escalateIncident = async (incidentId: string) => {
    await IncidentAPI.escalateIncident(incidentId);
    const updatedIncident = await IncidentAPI.getIncidentById(incidentId);
    dispatch({ type: "UPDATE_INCIDENT", payload: updatedIncident });
  };

  return (
    <IncidentContext.Provider
      value={{
        state,
        dispatch,
        createIncident,
        updateStatus,
        assignIncident,
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
  if (!context)
    throw new Error("useIncidents must be used within IncidentProvider");
  return context;
}
