import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Incident, IncidentStatus, User, Note } from '../types';
import { mockIncidents, mockUsers } from '../data/mockData';

interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  users: User[];
}

type IncidentAction =
  | { type: 'SET_INCIDENTS'; payload: Incident[] }
  | { type: 'SELECT_INCIDENT'; payload: Incident | null }
  | { type: 'UPDATE_INCIDENT'; payload: Incident }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'ADD_NOTE'; payload: { incidentId: string; note: Note } }
  | { type: 'ASSIGN_INCIDENT'; payload: { incidentId: string; user: User } }
  | { type: 'UPDATE_STATUS'; payload: { incidentId: string; status: IncidentStatus } }
  | { type: 'ESCALATE_INCIDENT'; payload: { incidentId: string } };

const initialState: IncidentState = {
  incidents: mockIncidents,
  selectedIncident: null,
  users: mockUsers,
};

function incidentReducer(state: IncidentState, action: IncidentAction): IncidentState {
  switch (action.type) {
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload };
    
    case 'SELECT_INCIDENT':
      return { ...state, selectedIncident: action.payload };
    
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(incident =>
          incident.id === action.payload.id ? action.payload : incident
        ),
        selectedIncident: state.selectedIncident?.id === action.payload.id ? action.payload : state.selectedIncident,
      };
    
    case 'ADD_INCIDENT':
      return {
        ...state,
        incidents: [action.payload, ...state.incidents],
      };
    
    case 'ADD_NOTE':
      return {
        ...state,
        incidents: state.incidents.map(incident =>
          incident.id === action.payload.incidentId
            ? { ...incident, notes: [...incident.notes, action.payload.note], updatedAt: new Date() }
            : incident
        ),
      };
    
    case 'ASSIGN_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(incident =>
          incident.id === action.payload.incidentId
            ? { ...incident, assignedTo: action.payload.user, updatedAt: new Date() }
            : incident
        ),
      };
    
    case 'UPDATE_STATUS':
      const now = new Date();
      return {
        ...state,
        incidents: state.incidents.map(incident => {
          if (incident.id === action.payload.incidentId) {
            const updates: Partial<Incident> = {
              status: action.payload.status,
              updatedAt: now,
            };
            
            if (action.payload.status === 'acknowledged' && !incident.acknowledgedAt) {
              updates.acknowledgedAt = now;
            } else if (action.payload.status === 'resolved' && !incident.resolvedAt) {
              updates.resolvedAt = now;
            } else if (action.payload.status === 'closed' && !incident.closedAt) {
              updates.closedAt = now;
            }
            
            return { ...incident, ...updates };
          }
          return incident;
        }),
      };
    
    case 'ESCALATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(incident =>
          incident.id === action.payload.incidentId
            ? { 
                ...incident, 
                escalationLevel: incident.escalationLevel + 1,
                priority: incident.priority === 'low' ? 'medium' : 
                         incident.priority === 'medium' ? 'high' : 'critical',
                updatedAt: new Date()
              }
            : incident
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

  return (
    <IncidentContext.Provider value={{ state, dispatch }}>
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
}