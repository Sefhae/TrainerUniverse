'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Check, Info, X } from 'lucide-react';
import { cn } from '@/lib/format';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = (idRef.current += 1);
      setToasts((list) => [...list, { id, type, message }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const api: ToastApi = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-5 right-5 z-[200] flex w-[330px] max-w-[calc(100vw-2.5rem)] flex-col gap-2.5">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ICONS: Record<ToastType, typeof Check> = {
  success: Check,
  error: X,
  info: Info,
};

const ACCENT: Record<ToastType, string> = {
  success: 'border-l-volt text-volt',
  error: 'border-l-red-500 text-red-400',
  info: 'border-l-white text-white',
};

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const Icon = ICONS[toast.type];
  return (
    <div
      className={cn(
        'animate-slide-in-right flex items-start gap-3 border border-white/10 border-l-[3px]',
        'bg-ink px-4 py-3.5 text-bone shadow-2xl shadow-black/40',
        ACCENT[toast.type]
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
      <p className="flex-1 pt-px text-sm leading-snug text-bone">{toast.message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="text-bone/40 transition-colors duration-200 hover:text-bone"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
