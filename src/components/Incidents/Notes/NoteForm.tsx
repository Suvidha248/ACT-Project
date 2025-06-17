import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncidents } from '../../../context/IncidentContext';
import { Button } from '../../Shared/Button';
import { MessageSquare, Lock, Send } from 'lucide-react';

interface NoteFormProps {
  incidentId: string;
}

export function NoteForm({ incidentId }: NoteFormProps) {
  const { state, dispatch } = useIncidents();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const note = {
      id: `note-${Date.now()}`,
      content: content.trim(),
      author: state.users[0], // Current user - in real app, this would come from auth
      createdAt: new Date(),
      isInternal,
    };

    dispatch({ type: 'ADD_NOTE', payload: { incidentId, note } });
    setContent('');
    setIsInternal(false);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Add Note or Comment
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
            onChange={(e) => setIsInternal(e.target.checked)}
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