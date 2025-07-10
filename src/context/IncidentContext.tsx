import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { getAllIncidents } from "../services/IncidentService";
import { getAllUsers } from "../services/userService"; // ✅ NEW
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
  | { type: "ADD_NOTE"; payload: { incidentId: string; note: Note } }
  | { type: "ASSIGN_INCIDENT"; payload: { incidentId: string; user: User } }
  | { type: "UPDATE_STATUS"; payload: { incidentId: string; status: IncidentStatus } }
  | { type: "ESCALATE_INCIDENT"; payload: { incidentId: string } };


const initialState: IncidentState = {
  incidents: [],
  selectedIncident: null,
  users: [],
  loading: false,
  error: null,
};

// export interface Note {
//   id: string;
//   content: string;
//   author: {
//     id: string;
//     name: string;
//     email: string;
//   };
//   createdAt: Date;
//   type?: 'system' | 'user' | 'escalation';
// }


function incidentReducer(
  state: IncidentState,
  action: IncidentAction
): IncidentState {
  switch (action.type) {
    case "SET_INCIDENTS":
      console.log("🔄 Reducer: Setting incidents", action.payload);
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
        error: action.payload ? null : state.error // Clear error when starting to load
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
        selectedIncident:
          state.selectedIncident?.id === action.payload.id
            ? action.payload
            : state.selectedIncident,
      };

    case "ADD_INCIDENT":
      return {
        ...state,
        incidents: [action.payload, ...state.incidents],
      };

    case "ADD_NOTE":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.incidentId
            ? {
              ...i,
              notes: [...i.notes, action.payload.note], // Now properly typed
              updatedAt: new Date(),
            }
            : i
        ),
      };


    case "ASSIGN_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.incidentId
            ? {
                ...i,
                assignedTo: action.payload.user,
                updatedAt: new Date(),
              }
            : i
        ),
      };

    case "UPDATE_STATUS": {
      const now = new Date();
      return {
        ...state,
        incidents: state.incidents.map((i) => {
          if (i.id !== action.payload.incidentId) return i;

          const updates: Partial<Incident> = {
            status: action.payload.status,
            updatedAt: now,
          };

          if (action.payload.status === "acknowledged" && !i.acknowledgedAt)
            updates.acknowledgedAt = now;
          else if (action.payload.status === "resolved" && !i.resolvedAt)
            updates.resolvedAt = now;
          else if (action.payload.status === "closed" && !i.closedAt)
            updates.closedAt = now;

          return { ...i, ...updates };
        }),
      };
    }

    case "ESCALATE_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.payload.incidentId
            ? {
                ...i,
                escalationLevel: i.escalationLevel + 1,
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


const IncidentContext = createContext<{
  state: IncidentState;
  dispatch: React.Dispatch<IncidentAction>;
} | null>(null);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(incidentReducer, initialState);

  useEffect(() => {
    const fetchIncidentsAndUsers = async () => {
      try {
        const [incidentsData, usersData] = await Promise.all([
          getAllIncidents(),
          getAllUsers(), // ✅ fetch users dynamically
        ]);
        dispatch({ type: "SET_INCIDENTS", payload: incidentsData });
        dispatch({ type: "SET_USERS", payload: usersData });
      } catch (error) {
        console.error("Failed to fetch incidents or users:", error);
      }
    };

    fetchIncidentsAndUsers();
  }, []);

  return (
    <IncidentContext.Provider value={{ state, dispatch }}>
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidents must be used within an IncidentProvider");
  }
  return context;
}
