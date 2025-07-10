import React, { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import { getFilteredIncidents } from "../services/IncidentService";
import { getAllUsers } from "../services/userService";
import { Incident, Note, User } from "../types";

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
}>({ state: initialState, dispatch: () => null });

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(incidentReducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const [incidentsRes, usersRes] = await Promise.all([getFilteredIncidents(), getAllUsers()]);
        dispatch({ type: "SET_INCIDENTS", payload: incidentsRes.data });
        dispatch({ type: "SET_USERS", payload: usersRes });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load incidents or users" });
      }
    };
    fetchData();
  }, []);

  return (
    <IncidentContext.Provider value={{ state, dispatch }}>
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) throw new Error("useIncidents must be used within IncidentProvider");
  return context;
}