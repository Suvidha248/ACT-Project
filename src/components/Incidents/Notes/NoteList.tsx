import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Lock, MessageSquare, RefreshCw, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Note, ServerNote } from '../../../types';

interface NoteListProps {
  notes: Note[];
  incidentId: string;
  assignee?: { id?: string; fullName: string; role: string }; // added optional id to match authors
}

// Union type for combined notes
type CombinedNote = Note | ServerNote;

export function NoteList({ notes, incidentId, assignee }: NoteListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverNotes, setServerNotes] = useState<ServerNote[]>([]);

  // Base URL configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Enhanced auth headers function
  const getAuthHeaders = (): Record<string, string> => {
    const token = sessionStorage.getItem("idToken");
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }

    return headers;
  };

  // Enhanced error handling function
  const handleApiError = (response: Response) => {
    switch (response.status) {
      case 401:
        console.error('Authentication expired');
        break;
      case 403:
        console.error('Access denied - insufficient permissions');
        break;
      case 404:
        console.error('Notes endpoint not found');
        break;
      case 500:
        console.error('Server error');
        break;
      default:
        console.error(`Request failed: ${response.status} ${response.statusText}`);
    }
  };

  // Load notes from server with authentication
  useEffect(() => {
    const loadServerNotes = async () => {
      try {
        console.log('📥 Loading notes for incident:', incidentId);

        const response = await fetch(`${API_BASE_URL}/api/incidents/${incidentId}/notes`, {
          method: 'GET',
          headers: getAuthHeaders() // ✅ Include authentication headers
        });

        console.log('📊 Notes load response status:', response.status);

        if (response.ok) {
          const fetchedNotes: ServerNote[] = await response.json();
          console.log('✅ Notes loaded successfully:', fetchedNotes.length, 'notes');
          setServerNotes(fetchedNotes);
        } else {
          console.error('❌ Failed to load notes:', response.status);
          handleApiError(response);

          if (response.status === 403) {
            console.warn('⚠️ Access denied when loading notes - check permissions');
          }
        }
      } catch (error) {
        console.error('❌ Network error loading notes:', error);
      }
    };

    if (incidentId) {
      loadServerNotes();
    }
  }, [incidentId, API_BASE_URL]);

  // Combine local and server notes with proper typing
  const allNotes: CombinedNote[] = [...serverNotes, ...notes].reduce(
    (unique: CombinedNote[], note: CombinedNote) => {
      const exists = unique.find((n: CombinedNote) => n.id === note.id);
      if (!exists) {
        unique.push(note);
      }
      return unique;
    },
    [] as CombinedNote[]
  );

  // Sort by creation date (newest first) with proper typing
  const sortedNotes = allNotes.sort((a: CombinedNote, b: CombinedNote) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Enhanced refresh function with authentication
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing notes for incident:', incidentId);

      const response = await fetch(`${API_BASE_URL}/api/incidents/${incidentId}/notes`, {
        method: 'GET',
        headers: getAuthHeaders() // ✅ Include authentication headers
      });

      console.log('📊 Refresh response status:', response.status);

      if (response.ok) {
        const fetchedNotes: ServerNote[] = await response.json();
        console.log('✅ Notes refreshed successfully:', fetchedNotes.length, 'notes');
        setServerNotes(fetchedNotes);
        toast.success('Notes refreshed successfully');
      } else {
        console.error('❌ Failed to refresh notes:', response.status);
        handleApiError(response);

        if (response.status === 403) {
          toast.error('Access denied. Cannot refresh notes.');
        } else {
          toast.error('Failed to refresh notes');
        }
      }
    } catch (error) {
      console.error('❌ Network error refreshing notes:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (sortedNotes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-500" />
        <p>No notes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-slate-300">
          Notes ({sortedNotes.length})
        </h4>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh notes"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
        {sortedNotes.map((note: CombinedNote, index: number) => {
          // Determine if note author matches assignee by id
          const isAssignee = assignee && note.author?.id === assignee.id;

          // Use assignee info if matched, else fallback to note author or Unknown User
          const displayName = isAssignee ? assignee.fullName : (note.author?.fullName || 'Unknown User');
          const displayRole = isAssignee ? assignee.role : (note.author?.role || 'User');

          return (
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
                    <p className="text-sm font-medium text-white">{displayName}</p>
                    <p className="text-xs text-slate-400 font-mono">{displayRole}</p>
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
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
