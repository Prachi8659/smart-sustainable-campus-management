import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-deep/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className={`relative w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all border border-campus-border`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-campus-border px-6 py-4 bg-slate-50/70">
            <h3 className="text-lg font-semibold text-navy-primary">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-campus-muted hover:bg-slate-200/60 hover:text-navy-primary transition-smooth"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(85vh-100px)] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
