'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { toast } from 'sonner';

type DirectMessage = {
  id: string;
  sender: 'member' | 'model' | string;
  body: string;
  createdAt: string;
  readByMemberAt: string | null;
};

export function MemberMessageWidget({ secureToken, modelName }: { secureToken: string; modelName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const unreadCount = open ? 0 : messages.filter((message) => message.sender === 'model' && !message.readByMemberAt).length;

  async function refresh(markRead = open) {
    const params = new URLSearchParams({ token: secureToken });
    if (markRead) params.set('markRead', '1');
    const response = await fetch(`/api/messages/member?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as { messages?: DirectMessage[] };
    setMessages(payload.messages ?? []);
  }

  useEffect(() => {
    void refresh(open);
    const intervalId = window.setInterval(() => void refresh(), open ? 2500 : 5000);
    return () => window.clearInterval(intervalId);
  }, [secureToken, open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [open, messages.length]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = body.trim();
    if (!content) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages/member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secureToken, body: content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Message non envoyé.');
      setBody('');
      await refresh(true);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {open ? (
        <section className="flex h-[min(76svh,560px)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-base-900 shadow-2xl shadow-black/60 sm:w-96">
          <header className="flex items-center justify-between gap-3 border-b border-base-800 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-50">Message direct</p>
              <p className="truncate text-xs text-neutral-500">Avec {modelName}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-base-700 bg-base-850 p-2 text-neutral-300">
              <X size={17} />
            </button>
          </header>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-base-950/65 p-4">
            {messages.map((message) => {
              const mine = message.sender === 'member';
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? 'bg-accent-500 text-white' : 'border border-base-800 bg-base-900 text-neutral-200'}`}>
                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
                    <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-neutral-500'}`}>{formatMessageTime(message.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 ? <p className="py-8 text-center text-sm text-neutral-500">Écrivez un message au modèle.</p> : null}
          </div>
          <form onSubmit={submit} className="border-t border-base-800 p-3">
            <div className="flex gap-2">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Votre message..."
                className="input-field min-h-12 flex-1 resize-none py-3"
                rows={1}
                maxLength={1000}
              />
              <button type="submit" disabled={sending || !body.trim()} className="btn-accent h-12 shrink-0 px-4" aria-label="Envoyer">
                <Send size={17} />
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-2xl shadow-accent-500/30">
          <MessageCircle size={24} />
          {unreadCount > 0 ? (
            <span className="absolute -right-2 -top-2 min-w-6 rounded-full bg-cyan-400 px-2 py-1 text-xs font-black text-base-950">{unreadCount}</span>
          ) : null}
        </button>
      )}
    </div>
  );
}

function formatMessageTime(value: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' }).format(new Date(value));
}
