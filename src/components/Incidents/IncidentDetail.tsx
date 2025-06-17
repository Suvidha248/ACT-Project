import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIncidents } from '../../context/IncidentContext';
import { IncidentActions } from './IncidentActions';
import { NoteList } from './Notes/NoteList';
import { NoteForm } from './Notes/NoteForm';
import { AIInsights } from './AIInsights';
import { Badge } from '../Shared/Badge';
import { Button } from '../Shared/Button';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useIncidents();
  
  const incident = state.incidents.find(i => i.id === id);
  
  if (!incident) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Incident not found</h3>
          <p className="text-gray-600 mb-4">The incident you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/incidents')}>
            Back to Incidents
          </Button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'red';
      case 'acknowledged': return 'yellow';
      case 'in-progress': return 'blue';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const isOverdue = new Date() > incident.slaDeadline && !['resolved', 'closed'].includes(incident.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/incidents')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Incidents
          </Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{incident.title}</h1>
            <p className="text-slate-400 font-mono">Incident ID: {incident.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={getPriorityColor(incident.priority)}>
            {incident.priority}
          </Badge>
          <Badge variant={getStatusColor(incident.status)}>
            {incident.status.replace('-', ' ')}
          </Badge>
          {incident.escalationLevel > 0 && (
            <Badge variant="red">
              <TrendingUp className="w-3 h-3 mr-1" />
              Escalated ({incident.escalationLevel})
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="red">Overdue</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Incident Details */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Incident Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Description</label>
                <p className="mt-1 text-white">{incident.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Alert Type</label>
                  <p className="mt-1 text-white capitalize">{incident.alertType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Location</label>
                  <p className="mt-1 text-white">{incident.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-white">Incident Created</p>
                  <p className="text-xs text-slate-400">
                    {format(incident.createdAt, 'PPpp')} ({formatDistanceToNow(incident.createdAt, { addSuffix: true })})
                  </p>
                </div>
              </div>
              
              {incident.acknowledgedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-white">Acknowledged</p>
                    <p className="text-xs text-slate-400">
                      {format(incident.acknowledgedAt, 'PPpp')} ({formatDistanceToNow(incident.acknowledgedAt, { addSuffix: true })})
                    </p>
                  </div>
                </div>
              )}
              
              {incident.resolvedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-white">Resolved</p>
                    <p className="text-xs text-slate-400">
                      {format(incident.resolvedAt, 'PPpp')} ({formatDistanceToNow(incident.resolvedAt, { addSuffix: true })})
                    </p>
                  </div>
                </div>
              )}
              
              {incident.closedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-white">Closed</p>
                    <p className="text-xs text-slate-400">
                      {format(incident.closedAt, 'PPpp')} ({formatDistanceToNow(incident.closedAt, { addSuffix: true })})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes & AI Insights Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notes */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Notes & Comments</h2>
              <NoteList notes={incident.notes} />
              <div className="mt-6">
                <NoteForm incidentId={incident.id} />
              </div>
            </div>

            {/* AI Insights */}
            <AIInsights incident={incident} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <IncidentActions incident={incident} />

          {/* Incident Info */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Incident Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Assigned To</p>
                  <p className="text-sm text-white">
                    {incident.assignedTo?.name || 'Unassigned'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Reported By</p>
                  <p className="text-sm text-white">{incident.reportedBy.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Location</p>
                  <p className="text-sm text-white">{incident.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">SLA Deadline</p>
                  <p className={`text-sm ${isOverdue ? 'text-red-400 font-medium' : 'text-white'}`}>
                    {format(incident.slaDeadline, 'PPpp')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Last Updated</p>
                  <p className="text-sm text-white">
                    {formatDistanceToNow(incident.updatedAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}