import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncidents } from '../../context/IncidentContext';
import { Incident, IncidentStatus } from '../../types';
import { Button } from '../Shared/Button';
import { Modal } from '../Shared/Modal';
import { 
  CheckCircle, 
  Play, 
  UserCheck, 
  TrendingUp, 
  XCircle,
  RotateCcw,
  Settings
} from 'lucide-react';

interface IncidentActionsProps {
  incident: Incident;
}

export function IncidentActions({ incident }: IncidentActionsProps) {
  const { state, dispatch } = useIncidents();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const handleStatusChange = (status: IncidentStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { incidentId: incident.id, status } });
  };

  const handleAssign = () => {
    if (selectedUser) {
      const user = state.users.find(u => u.id === selectedUser);
      if (user) {
        dispatch({ type: 'ASSIGN_INCIDENT', payload: { incidentId: incident.id, user } });
        setShowAssignModal(false);
        setSelectedUser('');
      }
    }
  };

  const handleEscalate = () => {
    dispatch({ type: 'ESCALATE_INCIDENT', payload: { incidentId: incident.id } });
  };

  const canAcknowledge = incident.status === 'new';
  const canStart = incident.status === 'acknowledged';
  const canResolve = incident.status === 'in-progress';
  const canClose = incident.status === 'resolved';
  const canReopen = incident.status === 'closed';

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Actions</h3>
          <p className="text-sm text-cyan-300/80">Incident management controls</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {canAcknowledge && (
          <Button
            onClick={() => handleStatusChange('acknowledged')}
            className="w-full"
            variant="primary"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Acknowledge
          </Button>
        )}
        
        {canStart && (
          <Button
            onClick={() => handleStatusChange('in-progress')}
            className="w-full"
            variant="primary"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Work
          </Button>
        )}
        
        {canResolve && (
          <Button
            onClick={() => handleStatusChange('resolved')}
            className="w-full"
            variant="success"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Resolved
          </Button>
        )}
        
        {canClose && (
          <Button
            onClick={() => handleStatusChange('closed')}
            className="w-full"
            variant="outline"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Close Incident
          </Button>
        )}
        
        {canReopen && (
          <Button
            onClick={() => handleStatusChange('new')}
            className="w-full"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reopen
          </Button>
        )}
        
        <Button
          onClick={() => setShowAssignModal(true)}
          className="w-full"
          variant="outline"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          {incident.assignedTo ? 'Reassign' : 'Assign'}
        </Button>
        
        {!['resolved', 'closed'].includes(incident.status) && (
          <Button
            onClick={handleEscalate}
            className="w-full"
            variant="danger"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Escalate
          </Button>
        )}
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Incident"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a user...</option>
              {state.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.role} ({user.department})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!selectedUser}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}