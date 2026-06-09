'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock, Package, User, XCircle } from 'lucide-react';
import api from '@/lib/client';
import { cn, formatPrice } from '@/lib/format';
import type { SessionRequest } from '@/lib/types';

export default function SessionRequestsPanel() {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<SessionRequest[]>('/session-requests');
      setRequests(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function respond(id: number, action: 'approve' | 'reject') {
    setActing(id);
    try {
      await api.put(`/session-requests/${id}`, { action });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r))
      );
    } catch { /* silent */ } finally {
      setActing(null);
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const resolved = requests.filter((r) => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">
            Pending Requests ({pending.length})
          </h2>
        </div>

        {pending.length === 0 ? (
          <p className="border border-ink/10 bg-white px-5 py-8 text-center text-sm text-ink/45">
            No pending requests.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                acting={acting === r.id}
                onApprove={() => respond(r.id, 'approve')}
                onReject={() => respond(r.id, 'reject')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">
              Resolved ({resolved.length})
            </h2>
          </div>
          <div className="space-y-3">
            {resolved.map((r) => (
              <RequestCard key={r.id} request={r} acting={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  acting,
  onApprove,
  onReject,
}: {
  request: SessionRequest;
  acting: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';

  return (
    <div className="border border-ink/10 bg-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          {/* Student */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-semibold text-xs text-bone">
              {request.studentName?.charAt(0)?.toUpperCase() ?? <User className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-semibold leading-tight">{request.studentName}</p>
              <p className="text-xs text-ink/45">{request.studentEmail}</p>
            </div>
          </div>

          {/* Package */}
          {request.packageName && (
            <div className="flex items-center gap-1.5 text-sm text-ink/60">
              <Package className="h-3.5 w-3.5 shrink-0" />
              {request.packageName}
            </div>
          )}

          {/* Message */}
          {request.message && (
            <p className="text-sm text-ink/70 italic">"{request.message}"</p>
          )}

          <p className="text-[11px] text-ink/35">
            {new Date(request.createdAt).toLocaleDateString([], {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </p>
        </div>

        {/* Status / Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isPending ? (
            <>
              <button
                onClick={onReject}
                disabled={acting}
                className="flex items-center gap-1.5 border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-40"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
              <button
                onClick={onApprove}
                disabled={acting}
                className="flex items-center gap-1.5 bg-volt px-3 py-1.5 text-xs font-semibold text-ink transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {acting ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Approve
              </button>
            </>
          ) : (
            <span
              className={cn(
                'px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
                isApproved ? 'bg-volt text-ink' : 'bg-red-100 text-red-700'
              )}
            >
              {isApproved ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
