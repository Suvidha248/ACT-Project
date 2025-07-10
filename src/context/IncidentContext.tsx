import React, { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import {
  addNoteToIncident as addNoteToIncidentAPI,
  assignIncident as assignIncidentAPI,
  createIncident as createIncidentAPI,
  escalateIncident as escalateIncidentAPI,
  getFilteredIncidents,
  updateIncidentStatus as updateIncidentStatusAPI,
} from "../services/IncidentService";
import { getAllUsers } from "../services/userService";
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
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_INCIDENT"; payload: Incident }
  | { type: "ADD_INCIDENT"; payload: Incident }
  | { type: "ADD_NOTE"; payload: { incidentId: string; note: Note } }
  | { type: "ESCALATE_INCIDENT"; payload: { incidentId: string } };

const initialState: IncidentState = {
  incidents: [],
  selectedIncident: null,
  users: [],
  loading: false,
  error: null,
};

function incidentReducer(state: IncidentState, action: IncidentAction): IncidentState {
  switch (action.type) {
    case "SET_INCIDENTS":
      return { ...state, incidents: action.payload, loading: false, error: null };
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "UPDATE_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.map((i) => (i.id === action.payload.id ? action.payload : i)),
      };
    case "ADD_INCIDENT":
      return { ...state, incidents: [action.payload, ...state.incidents] };
    case "ADD_NOTE":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.incidentId
            ? { ...i, notes: [...i.notes, action.payload.note], updatedAt: new Date() }
            : i
        ),
      };
    case "ESCALATE_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.incidentId
            ? { ...i, escalationLevel: (i.escalationLevel || 0) + 1, updatedAt: new Date() }
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
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const [incidentRes, usersRes] = await Promise.all([getFilteredIncidents(), getAllUsers()]);
        dispatch({ type: "SET_INCIDENTS", payload: incidentRes.data });
        dispatch({ type: "SET_USERS", payload: usersRes });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load data.";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    };
    fetchData();
  }, []);

  const createIncident = async (data: Partial<Incident>) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const newIncident = await createIncidentAPI(data as Incident);
      dispatch({ type: "ADD_INCIDENT", payload: newIncident });
    } catch (err) {
      console.log(err);
      dispatch({ type: "SET_ERROR", payload: "Failed to create incident." });
    }
  };

  const updateStatus = async (id: string, status: IncidentStatus) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await updateIncidentStatusAPI(id, status);
      const updatedIncidents = await getFilteredIncidents();
      dispatch({ type: "SET_INCIDENTS", payload: updatedIncidents.data });
    } catch (err) {
      console.log(err);
      dispatch({ type: "SET_ERROR", payload: "Failed to update status." });
    }
  };

  const assignIncident = async (id: string, userId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await assignIncidentAPI(id, userId);
      const updatedIncidents = await getFilteredIncidents();
      dispatch({ type: "SET_INCIDENTS", payload: updatedIncidents.data });
    } catch (err) {
      console.log(err);
      dispatch({ type: "SET_ERROR", payload: "Failed to assign incident." });
    }
  };

  const addNote = async (incidentId: string, note: Note) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const savedNote = await addNoteToIncidentAPI(incidentId, note); // ✅ returns Note
      dispatch({ type: "ADD_NOTE", payload: { incidentId, note: savedNote } });
    } catch (err) {
      console.log(err);
      dispatch({ type: "SET_ERROR", payload: "Failed to add note." });
    }
  };

  const escalateIncident = async (incidentId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await escalateIncidentAPI(incidentId);
      const updatedIncidents = await getFilteredIncidents();
      dispatch({ type: "SET_INCIDENTS", payload: updatedIncidents.data });
    } catch (err) {
      console.log(err);
      dispatch({ type: "SET_ERROR", payload: "Failed to escalate incident." });
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