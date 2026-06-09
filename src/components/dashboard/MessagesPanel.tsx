'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../lib/client';
import { useT } from '../../hooks/useLanguage';
import { cn } from '../../lib/format';
import type { Message } from '../../lib/types';

interface Peer { id: number; name: string; }

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? time : isYesterday ? `Yesterday ${time}` : `${d.toLocaleDateString()} ${time}`;
}

interface Props {
  role: 'trainer' | 'student';
  myTrainerId?: number;
  myStudentId?: number;
}

export default function MessagesPanel({ role, myTrainerId, myStudentId }: Props) {
  const t = useT();
  const [peers, setPeers] = useState<Peer[]>([]);
  const [selected, setSelected] = useState<Peer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Load list of peers (students for trainer, trainers for student)
  useEffect(() => {
    if (role === 'trainer') {
      api.get<{ id: number; name: string }[]>('/trainer/students')
        .then(({ data }) => setPeers(data))
        .catch(() => {});
    }
    // For a student, peers are the trainers they're enrolled with (approved
    // requests) — available for messaging even before any session is scheduled.
    if (role === 'student') {
      api.get<{ id: number; name: string }[]>('/student/trainers')
        .then(({ data }) => setPeers(data.map((t) => ({ id: t.id, name: t.name || 'Trainer' }))))
        .catch(() => {});
    }
  }, [role]);

  // Open the first conversation automatically so incoming messages are visible
  // immediately (otherwise the thread stays hidden until a peer is clicked).
  useEffect(() => {
    if (!selected && peers.length > 0) setSelected(peers[0]);
  }, [peers, selected]);

  const loadMessages = useCallback(async (peer: Peer) => {
    const trainerId = role === 'trainer' ? myTrainerId : peer.id;
    const studentId = role === 'student' ? myStudentId : peer.id;
    if (!trainerId || !studentId) return;
    try {
      const { data } = await api.get<Message[]>(`/messages/${trainerId}/${studentId}`);
      setMessages(data);
    } catch { /* silent */ }
  }, [role, myTrainerId, myStudentId]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected);
    pollRef.current = setInterval(() => loadMessages(selected), 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selected, loadMessages]);

  // Auto-scroll the message list to the bottom only when a NEW message arrives,
  // and only the list element itself — never the page. (scrollIntoView on a
  // marker scrolls every ancestor, which yanked the whole page on each poll.)
  useEffect(() => {
    const el = listRef.current;
    if (el && messages.length > prevCount.current) el.scrollTop = el.scrollHeight;
    prevCount.current = messages.length;
  }, [messages]);

  // Reset the counter when switching threads so the new thread opens at bottom.
  useEffect(() => { prevCount.current = 0; }, [selected]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !selected) return;
    const trainerId = role === 'trainer' ? myTrainerId : selected.id;
    const studentId = role === 'student' ? myStudentId : selected.id;
    if (!trainerId || !studentId) return;
    setSending(true);
    try {
      await api.post(`/messages/${trainerId}/${studentId}`, { content: content.trim() });
      setContent('');
      loadMessages(selected);
    } catch { /* silent */ } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex border border-ink/10 bg-white" style={{ minHeight: '520px' }}>
      {/* Peer list */}
      <div className="w-52 shrink-0 border-r border-ink/10 lg:w-64">
        <div className="border-b border-ink/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.chat.title}</p>
        </div>
        {peers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink/40">{t.chat.selectStudent}</p>
        ) : (
          <div className="divide-y divide-ink/8">
            {peers.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                  selected?.id === p.id ? 'bg-volt/10 font-semibold' : 'hover:bg-ink/[0.03]'
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-display text-sm text-bone">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-sm">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-sm text-ink/35">
            {t.chat.selectStudent}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center bg-ink font-display text-sm text-bone">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold">{selected.name}</p>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: '380px' }}>
              {messages.length === 0 ? (
                <p className="text-center text-sm text-ink/40 py-8">{t.chat.noMessages}</p>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender === role;
                  return (
                    <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[75%] rounded-sm px-3 py-2 text-sm',
                          isMine ? 'bg-ink text-bone' : 'bg-ink/8 text-ink'
                        )}
                      >
                        <p>{m.content}</p>
                        <p className={cn('mt-1 text-[10px]', isMine ? 'text-bone/50' : 'text-ink/40')}>
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={send} className="flex items-center gap-2 border-t border-ink/10 px-4 py-3">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.chat.placeholder}
                className="flex-1 border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !content.trim()}
                className="flex items-center gap-1.5 bg-ink px-4 py-2 text-sm font-semibold text-bone transition hover:bg-charcoal disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {t.chat.send}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
