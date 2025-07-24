import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = "" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Enhanced dark overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black/70 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        {/* Dark themed modal container */}
        <div className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow-2xl rounded-xl glass-card border border-white/10 backdrop-blur-xl ${className}`}>
          {/* Dark themed header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content area with dark theme support */}
          <div className="text-slate-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
