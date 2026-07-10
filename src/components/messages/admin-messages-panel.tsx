'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

type Conversation = {
  id: string;
  username: string;
  platform: string;
  unreadCount: number;
  lastMessage: { body: string; sender: string; createdAt: string | Date } | null;
};

type DirectMessage = {
  id: string;
  sender: 'member' | 'model' | string;
  body: string;
  createdAt: string;
};

export function AdminMessagesPanel({ initialConversations }: { initialConversations: Conversation[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id ?? '');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  async function refreshConversations() {
    const response = await fetch('/api/messages/admin', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as { conversations?: Conversation[] };
    setConversations(payload.conversations ?? []);
  }

  async function refreshMessages(memberId = selectedId) {
    if (!memberId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/admin?memberId=${encodeURIComponent(memberId)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as { messages?: DirectMessage[] };
      setMessages(payload.messages ?? []);
      void refreshConversations();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshMessages(selectedId);
  }, [selectedId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshConversations();
      void refreshMessages(selectedId);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [selectedId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, selectedId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = body.trim();
    if (!selectedId || !content) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: selectedId, body: content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Message non envoyé.');
      setBody('');
      await refreshMessages(selectedId);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100svh-12rem)] overflow-hidden rounded-3xl border border-base-800 bg-base-900 shadow-2xl lg:grid-cols-[340px_1fr]">
      <aside className="border-b border-base-800 lg:border-b-0 lg:border-r">
        <div className="border-b border-base-800 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <MessageCircle size={18} className="text-accent-300" />
            Conversations
          </div>
        </div>
        <div className="max-h-[38svh] overflow-y-auto lg:max-h-[calc(100svh-17rem)]">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={`flex w-full items-start gap-3 border-b border-base-800 px-4 py-3 text-left transition-colors hover:bg-base-850 ${
                selectedId === conversation.id ? 'bg-base-850' : ''
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-500/15 text-sm font-black text-accent-200">
                {conversation.username.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-neutral-100">{conversation.username}</span>
                  {conversation.unreadCount > 0 ? (
                    <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-black text-white">{conversation.unreadCount}</span>
                  ) : null}
                </span>
                <span className="mt-1 block truncate text-xs text-neutral-500">
                  {conversation.lastMessage?.body ?? conversation.platform}
                </span>
              </span>
            </button>
          ))}
          {conversations.length === 0 ? <p className="p-6 text-center text-sm text-neutral-500">Aucun membre pour le moment.</p> : null}
        </div>
      </aside>

      <section className="flex min-h-[520px] flex-col">
        <header className="border-b border-base-800 p-4">
          <p className="text-sm font-semibold text-neutral-100">{selected?.username ?? 'Sélectionnez une conversation'}</p>
          <p className="text-xs text-neutral-500">{selected?.platform ?? 'Les messages apparaîtront ici.'}</p>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-base-950/55 p-4">
          {loading && messages.length === 0 ? <p className="text-center text-sm text-neutral-500">Chargement...</p> : null}
          {messages.map((message) => {
            const mine = message.sender === 'model';
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[min(82vw,620px)] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
                    mine ? 'bg-accent-500 text-white' : 'border border-base-800 bg-base-900 text-neutral-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-neutral-500'}`}>{formatMessageTime(message.createdAt)}</p>
                </div>
              </div>
            );
          })}
          {!loading && selectedId && messages.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-base-700 p-6 text-center text-sm text-neutral-500">
              Aucun message dans cette conversation.
            </p>
          ) : null}
        </div>

        <form onSubmit={submit} className="border-t border-base-800 bg-base-900 p-3">
          <div className="flex gap-2">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              disabled={!selectedId || sending}
              placeholder="Répondre au membre..."
              className="input-field min-h-12 flex-1 resize-none py-3"
              rows={1}
              maxLength={1000}
            />
            <button type="submit" disabled={!selectedId || sending || !body.trim()} className="btn-accent h-12 shrink-0 px-4">
              <Send size={17} />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function formatMessageTime(value: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
