import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncidents } from '../../context/IncidentContext';
import { Button } from '../Shared/Button';
import { Modal } from '../Shared/Modal';
import { IncidentPriority, AlertType } from '../../types';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User, 
  FileText, 
  Tag,
  Brain,
  Zap,
  Shield,
  Package,
  Thermometer,
  Droplets,
  X
} from 'lucide-react';

interface IncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const facilities = [
  'Rochelle - ASRS Zone A-12',
  'Rochelle - ASRS Zone B-8',
  'Rochelle - WES Processing Center',
  'Rochelle - Gantry Descrambler Unit 3',
  'Gateway - Gantry LP North',
  'Gateway - Gantry LP South',
  'Gateway - Cold Storage C-8',
  'Gateway - IT Infrastructure',
  'Russellville - Trolley Loop 1',
  'Russellville - Trolley Loop 2',
  'Russellville - Infeed Conveyor B-7',
  'Multi-site - Network Infrastructure'
];

const alertTypeOptions = [
  { value: 'equipment', label: 'Equipment Failure', icon: Package, color: 'from-orange-500 to-red-500' },
  { value: 'security', label: 'Security Breach', icon: Shield, color: 'from-red-500 to-pink-500' },
  { value: 'temperature', label: 'Temperature Alert', icon: Thermometer, color: 'from-blue-500 to-cyan-500' },
  { value: 'humidity', label: 'Humidity Issue', icon: Droplets, color: 'from-cyan-500 to-blue-500' },
  { value: 'inventory', label: 'Inventory Problem', icon: Package, color: 'from-purple-500 to-pink-500' },
  { value: 'safety', label: 'Safety Concern', icon: AlertTriangle, color: 'from-red-500 to-orange-500' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'from-green-500 to-emerald-500', description: 'Minor issue, can wait' },
  { value: 'medium', label: 'Medium', color: 'from-yellow-500 to-amber-500', description: 'Moderate impact' },
  { value: 'high', label: 'High', color: 'from-orange-500 to-red-500', description: 'Significant impact' },
  { value: 'critical', label: 'Critical', color: 'from-red-500 to-pink-500', description: 'Immediate attention required' }
];

export function IncidentForm({ isOpen, onClose }: IncidentFormProps) {
  const { state, dispatch } = useIncidents();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    alertType: 'equipment' as AlertType,
    priority: 'medium' as IncidentPriority,
    additionalDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newIncident = {
        id: `ACT-${formData.location.split(' ')[0].toUpperCase()}-${String(Date.now()).slice(-3)}`,
        title: formData.title,
        description: formData.description,
        status: 'new' as const,
        priority: formData.priority,
        alertType: formData.alertType,
        location: formData.location,
        reportedBy: state.users[0], // Current user
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: [],
        escalationLevel: 0,
        slaDeadline: new Date(Date.now() + (formData.priority === 'critical' ? 2 : formData.priority === 'high' ? 4 : 8) * 60 * 60 * 1000)
      };
      
      dispatch({ type: 'ADD_INCIDENT', payload: newIncident });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        alertType: 'equipment',
        priority: 'medium',
        additionalDetails: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating incident:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedAlertType = alertTypeOptions.find(option => option.value === formData.alertType);
  const selectedPriority = priorityOptions.find(option => option.value === formData.priority);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <motion.div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div 
          className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform glass-card shadow-2xl rounded-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create New Incident</h3>
                <p className="text-sm text-slate-400">Report a new warehouse incident or alert</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Incident Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the incident"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                  errors.title ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Alert Type & Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alert Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Alert Type *
                </label>
                <div className="space-y-2">
                  {alertTypeOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                        formData.alertType === option.value
                          ? 'bg-white/10 border border-cyan-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/8'
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <input
                        type="radio"
                        name="alertType"
                        value={option.value}
                        checked={formData.alertType === option.value}
                        onChange={(e) => handleInputChange('alertType', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color}`}>
                        <option.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium">{option.label}</span>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <Zap className="w-4 h-4 inline mr-2" />
                  Priority Level *
                </label>
                <div className="space-y-2">
                  {priorityOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        formData.priority === option.value
                          ? 'bg-white/10 border border-cyan-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/8'
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="priority"
                          value={option.value}
                          checked={formData.priority === option.value}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${option.color}`} />
                        <div>
                          <span className="text-white font-medium">{option.label}</span>
                          <p className="text-xs text-slate-400">{option.description}</p>
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Facility Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                  errors.location ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="">Select facility location...</option>
                {facilities.map((facility) => (
                  <option key={facility} value={facility} className="bg-slate-800">
                    {facility}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-400">{errors.location}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed information about the incident, including symptoms, error codes, and any relevant context..."
                rows={4}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none ${
                  errors.description ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Brain className="w-4 h-4 inline mr-2" />
                Additional Context (Optional)
              </label>
              <textarea
                value={formData.additionalDetails}
                onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                placeholder="Any additional information, troubleshooting steps already taken, or relevant system logs..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* AI Suggestion Panel */}
            <motion.div 
              className="p-4 glass-card rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">AI Suggestion</span>
              </div>
              <p className="text-xs text-slate-300">
                {selectedPriority && selectedAlertType && (
                  <>Based on the {selectedPriority.label.toLowerCase()} priority {selectedAlertType.label.toLowerCase()}, 
                  this incident will be automatically assigned to the appropriate team and escalated according to ACT protocols.</>
                )}
              </p>
            </motion.div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creating Incident...' : 'Create Incident'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}