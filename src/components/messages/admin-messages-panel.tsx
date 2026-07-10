'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Headset, MessageCircle, Send, UserRound } from 'lucide-react';
import { toast } from 'sonner';

type Conversation = {
  id: string;
  username: string;
  platform: string;
  unreadCount: number;
  lastMessage: { body: string; sender: string; createdAt: string | Date } | null;
};

type MemberMessage = {
  kind: 'member';
  id: string;
  sender: 'member' | 'model' | string;
  body: string;
  createdAt: string;
};

type InternalMessage = {
  kind: 'internal';
  id: string;
  senderAdminId: string;
  recipientAdminId: string;
  body: string;
  createdAt: string;
};

type ChatMessage = MemberMessage | InternalMessage;

type QuickContact = {
  id: string;
  label: string;
  detail: string;
  kind: 'model' | 'support';
  unreadCount: number;
};

type SelectedTarget = { kind: 'member' | 'internal'; id: string };

export function AdminMessagesPanel({
  currentAdminId,
  initialConversations,
  quickContacts = [],
}: {
  currentAdminId: string;
  initialConversations: Conversation[];
  quickContacts?: QuickContact[];
}) {
  const firstTarget = initialConversations[0]
    ? { kind: 'member' as const, id: initialConversations[0].id }
    : quickContacts[0]
      ? { kind: 'internal' as const, id: quickContacts[0].id }
      : null;

  const [conversations, setConversations] = useState(initialConversations);
  const [quickContactItems, setQuickContactItems] = useState(quickContacts);
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(firstTarget);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const requestSeqRef = useRef(0);

  const selectedMember = useMemo(
    () => (selectedTarget?.kind === 'member' ? conversations.find((conversation) => conversation.id === selectedTarget.id) ?? null : null),
    [conversations, selectedTarget],
  );
  const selectedContact = useMemo(
    () => (selectedTarget?.kind === 'internal' ? quickContactItems.find((contact) => contact.id === selectedTarget.id) ?? null : null),
    [quickContactItems, selectedTarget],
  );
  const selectedTitle = selectedMember?.username ?? selectedContact?.label ?? 'Sélectionnez une conversation';
  const selectedSubtitle = selectedMember?.platform ?? selectedContact?.detail ?? 'Les messages apparaîtront ici.';
  const displayedMessages = useMemo(() => [...messages].reverse(), [messages]);

  async function refreshConversations() {
    const response = await fetch('/api/messages/admin', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as { conversations?: Conversation[] };
    setConversations(payload.conversations ?? []);
  }

  async function refreshInternalUnread() {
    const response = await fetch('/api/messages/internal', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as { unreadByContact?: { contactId: string; count: number }[] };
    const unreadByContact = new Map((payload.unreadByContact ?? []).map((item) => [item.contactId, item.count]));
    setQuickContactItems((current) =>
      current.map((contact) => ({
        ...contact,
        unreadCount: selectedTarget?.kind === 'internal' && selectedTarget.id === contact.id ? 0 : unreadByContact.get(contact.id) ?? 0,
      })),
    );
  }

  async function refreshMessages(target = selectedTarget, options: { showLoading?: boolean } = {}) {
    if (!target) return;
    const requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    if (options.showLoading) setLoading(true);

    try {
      const url =
        target.kind === 'member'
          ? `/api/messages/admin?memberId=${encodeURIComponent(target.id)}`
          : `/api/messages/internal?contactId=${encodeURIComponent(target.id)}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as { messages?: Array<Omit<MemberMessage, 'kind'> | Omit<InternalMessage, 'kind'>> };
      if (requestSeqRef.current !== requestSeq) return;
      setMessages((payload.messages ?? []).map((message) => ({ ...message, kind: target.kind })) as ChatMessage[]);
      void refreshConversations();
      void refreshInternalUnread();
    } finally {
      if (options.showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    setMessages([]);
    void refreshMessages(selectedTarget, { showLoading: true });
  }, [selectedTarget]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshConversations();
      void refreshInternalUnread();
      void refreshMessages(selectedTarget);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [selectedTarget]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [messages.length, selectedTarget]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = body.trim();
    if (!selectedTarget || !content) return;

    const createdAt = new Date().toISOString();
    const optimisticMessage: ChatMessage =
      selectedTarget.kind === 'member'
        ? { kind: 'member', id: `optimistic-${Date.now()}`, sender: 'model', body: content, createdAt }
        : {
            kind: 'internal',
            id: `optimistic-${Date.now()}`,
            senderAdminId: currentAdminId,
            recipientAdminId: selectedTarget.id,
            body: content,
            createdAt,
          };

    setMessages((current) => [...current, optimisticMessage]);
    if (selectedTarget.kind === 'member') {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedTarget.id ? { ...conversation, lastMessage: { body: content, sender: 'model', createdAt } } : conversation,
        ),
      );
    }
    setBody('');
    setSending(true);

    try {
      const response = await fetch(selectedTarget.kind === 'member' ? '/api/messages/admin' : '/api/messages/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTarget.kind === 'member' ? { memberId: selectedTarget.id, body: content } : { contactId: selectedTarget.id, body: content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Message non envoyé.');
      setMessages((current) =>
        current.map((message) => (message.id === optimisticMessage.id ? ({ ...payload.message, kind: selectedTarget.kind } as ChatMessage) : message)),
      );
      void refreshConversations();
      void refreshInternalUnread();
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
      setBody(content);
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  }

  function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <div className="flex h-[calc(100svh-10rem)] min-h-[620px] flex-col overflow-hidden rounded-3xl border border-base-800 bg-base-900 shadow-2xl">
      {quickContactItems.length > 0 ? (
        <div className="sticky top-0 z-10 border-b border-base-800 bg-base-900/95 p-3 backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickContactItems.map((contact) => {
              const selected = selectedTarget?.kind === 'internal' && selectedTarget.id === contact.id;
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedTarget({ kind: 'internal', id: contact.id })}
                  className={`inline-flex min-w-max items-center gap-2 rounded-2xl border px-3 py-2 text-left shadow-lg shadow-black/10 transition-colors ${
                    selected ? 'border-accent-400/60 bg-accent-500/15' : 'border-white/10 bg-base-950 hover:border-accent-400/40'
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-200">
                    {contact.kind === 'support' ? <Headset size={17} /> : <UserRound size={17} />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-xs font-bold text-neutral-100">
                      {contact.label}
                      {contact.unreadCount > 0 ? <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-black text-white">{contact.unreadCount}</span> : null}
                    </span>
                    <span className="block max-w-48 truncate text-[11px] text-neutral-500">{contact.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[340px_1fr]">
        <aside className="min-h-0 overflow-hidden border-b border-base-800 lg:border-b-0 lg:border-r">
          <div className="border-b border-base-800 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <MessageCircle size={18} className="text-accent-300" />
              Conversations membres
            </div>
          </div>
          <div className="max-h-[34svh] overflow-y-auto overscroll-contain lg:h-[calc(100%-57px)] lg:max-h-none">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedTarget({ kind: 'member', id: conversation.id })}
                className={`flex w-full items-start gap-3 border-b border-base-800 px-4 py-3 text-left transition-colors hover:bg-base-850 ${
                  selectedTarget?.kind === 'member' && selectedTarget.id === conversation.id ? 'bg-base-850' : ''
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

        <section className="flex min-h-0 flex-col overflow-hidden">
          <header className="border-b border-base-800 p-4">
            <p className="text-sm font-semibold text-neutral-100">{selectedTitle}</p>
            <p className="text-xs text-neutral-500">{selectedSubtitle}</p>
          </header>

          <form onSubmit={submit} className="sticky top-0 z-10 border-b border-base-800 bg-base-900 p-3 shadow-lg shadow-black/10">
            <div className="flex gap-2">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={submitOnEnter}
                disabled={!selectedTarget || sending}
                placeholder={selectedTarget?.kind === 'internal' ? 'Écrire un message...' : 'Répondre au membre...'}
                className="input-field min-h-12 flex-1 resize-none py-3"
                rows={1}
                maxLength={1000}
              />
              <button type="submit" disabled={!selectedTarget || sending || !body.trim()} className="btn-accent h-12 shrink-0 px-4">
                <Send size={17} />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </div>
          </form>

          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-base-950/55 p-4">
            {loading ? <p className="text-center text-sm text-neutral-500">Chargement...</p> : null}
            {displayedMessages.map((message) => {
              const mine = message.kind === 'member' ? message.sender === 'model' : message.senderAdminId === currentAdminId;
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
            {!loading && selectedTarget && messages.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-base-700 p-6 text-center text-sm text-neutral-500">
                Aucun message dans cette conversation.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatMessageTime(value: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
