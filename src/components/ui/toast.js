"use client";
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: 'bg-brutal-green border-brutal-black text-black',
  error: 'bg-red-500 border-brutal-black text-white',
  warning: 'bg-brutal-yellow border-brutal-black text-black',
  info: 'bg-brutal-blue border-brutal-black text-white',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastIdRef.current;
    
    setToasts(prev => [...prev, { id, type, title, message, exiting: false }]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        // Start exit animation
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        // Remove after animation
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  // Convenience methods
  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message, duration: 6000 }),
    warning: (title, message) => addToast({ type: 'warning', title, message, duration: 5000 }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container — fixed top-right */}
      <div 
        className="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none"
        style={{ maxWidth: '420px', width: '100%' }}
      >
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto
                flex items-start gap-3 p-4 
                border-4 shadow-[4px_4px_0_rgba(0,0,0,1)]
                ${TOAST_STYLES[t.type]}
                ${t.exiting ? 'animate-toast-exit' : 'animate-toast-enter'}
              `}
              role="alert"
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={3} />
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="font-black text-sm uppercase tracking-wide leading-tight">{t.title}</p>
                )}
                {t.message && (
                  <p className="font-bold text-sm mt-0.5 opacity-90 leading-snug">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-0.5 hover:opacity-70 transition-opacity"
                aria-label="Close"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications anywhere.
 * 
 * Usage:
 *   const toast = useToast();
 *   toast.success('Uploaded!', 'Your resume has been submitted.');
 *   toast.error('Failed', 'Something went wrong.');
 *   toast.warning('Heads up', 'You have 3 credits left.');
 *   toast.info('Processing', 'AI is analyzing your resume...');
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
}
