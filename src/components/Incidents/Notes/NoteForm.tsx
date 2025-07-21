import { motion } from 'framer-motion';
import { debounce } from 'lodash';
import { Lock, MessageSquare, Save, Send } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useIncidents } from '../../../context/IncidentContext';
import { Button } from '../../Shared/Button';

interface NoteFormProps {
  incidentId: string;
}

export function NoteForm({ incidentId }: NoteFormProps) {
  const { state, dispatch } = useIncidents();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Base URL configuration
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

  // ✅ Fixed: Auth headers function with proper typing
const getAuthHeaders = (): Record<string, string> => {
  const token = sessionStorage.getItem("idToken");
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};


  // Auto-save draft every 3 seconds
  const autoSaveDraft = useCallback(
    debounce(async (content: string) => {
      if (!content.trim()) return;
      
      try {
        setIsSaving(true);
        const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/notes/draft`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ content, isInternal })
        });
        
        if (response.ok) {
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          localStorage.setItem(`incident_${incidentId}_draft`, JSON.stringify({ content, isInternal }));
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 3000),
    [incidentId, isInternal, API_BASE_URL]
  );

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftResponse = await fetch(`${API_BASE_URL}/incidents/${incidentId}/notes/draft`, {
          headers: getAuthHeaders()
        });
        if (draftResponse.ok) {
          const draft = await draftResponse.json();
          if (draft.content) {
            setContent(draft.content);
            setIsInternal(draft.isInternal || false);
          }
        } else {
          // Fallback to localStorage
          const savedDraft = localStorage.getItem(`incident_${incidentId}_draft`);
          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            setContent(parsed.content || '');
            setIsInternal(parsed.isInternal || false);
            setHasUnsavedChanges(true);
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };

    loadDraft();
  }, [incidentId, API_BASE_URL]);

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasUnsavedChanges(true);
    autoSaveDraft(newContent);
  };

  // Handle checkbox changes
  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIsInternal = e.target.checked;
    setIsInternal(newIsInternal);
    setHasUnsavedChanges(true);
    if (content.trim()) {
      autoSaveDraft(content);
    }
  };

  // Submit final note
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content: content.trim(),
          type: 'comment',
          isInternal
        })
      });

      if (response.ok) {
        const savedNote = await response.json();
        
        // Update local state using existing dispatch
        const note = {
          id: savedNote.id,
          content: content.trim(),
          author: state.users[0],
          createdAt: new Date(),
          isInternal,
        };
        
        dispatch({ type: 'ADD_NOTE', payload: { incidentId, note } });
        
        // Clear form and draft
        setContent('');
        setIsInternal(false);
        setHasUnsavedChanges(false);
        
        // Clear draft from server and localStorage
        await fetch(`${API_BASE_URL}/incidents/${incidentId}/notes/draft`, { 
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        localStorage.removeItem(`incident_${incidentId}_draft`);
        
        toast.success('Note added successfully');
      } else {
        toast.error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-white">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Add Note or Comment
          </label>
          <div className="text-xs text-slate-400">
            {isSaving && (
              <span className="flex items-center space-x-1">
                <Save className="w-3 h-3 animate-pulse" />
                <span>Saving draft...</span>
              </span>
            )}
            {!isSaving && lastSaved && (
              <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
            )}
            {hasUnsavedChanges && !isSaving && (
              <span className="text-yellow-400">Unsaved changes</span>
            )}
          </div>
        </div>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Enter your note, comment, or update about this incident..."
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <motion.label 
          className="flex items-center space-x-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <input
            type="checkbox"
            checked={isInternal}
            onChange={handleInternalChange}
            className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-300 flex items-center space-x-1">
            <Lock className="w-3 h-3 text-orange-400" />
            <span>Internal note (team only)</span>
          </span>
        </motion.label>
        
        <Button
          type="submit"
          disabled={!content.trim()}
          size="sm"
          variant="primary"
        >
          <Send className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>
    </motion.form>
  );
}