import React from 'react';
import { motion } from 'framer-motion';
import { Note } from '../../../types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Lock, User } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-500" />
        <p>No notes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
      {notes.map((note, index) => (
        <motion.div 
          key={note.id} 
          className="glass-card-hover p-4 border border-white/10 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{note.author.name}</p>
                <p className="text-xs text-slate-400 font-mono">{note.author.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {note.isInternal && (
                <div className="flex items-center space-x-1 text-orange-400">
                  <Lock className="w-3 h-3" />
                  <span className="text-xs font-medium">Internal</span>
                </div>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {formatDistanceToNow(note.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>
        </motion.div>
      ))}
    </div>
  );
}