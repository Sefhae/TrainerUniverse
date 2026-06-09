'use client';

import { TriangleAlert } from 'lucide-react';
import Modal from './Modal';
import { cn } from '@/lib/format';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="text-center">
        <div
          className={cn(
            'mx-auto flex h-14 w-14 items-center justify-center',
            destructive ? 'bg-red-50 text-red-600' : 'bg-ink/5 text-ink'
          )}
        >
          <TriangleAlert className="h-7 w-7" />
        </div>
        <h3 className="mt-5 font-display text-2xl tracking-wide">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{message}</p>

        <div className="mt-7 flex gap-3">
          <button onClick={onCancel} disabled={loading} className="btn btn-outline-dark flex-1">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'btn flex-1',
              destructive ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-volt'
            )}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
