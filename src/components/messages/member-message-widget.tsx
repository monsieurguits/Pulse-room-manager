'use client';

import { FormEvent, KeyboardEvent, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Search, Send, ShieldAlert, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';

type DirectMessage = {
  id: string;
  sender: 'member' | 'model' | string;
  body: string;
  createdAt: string;
  readByMemberAt: string | null;
};

type PeerMessage = {
  id: string;
  senderMemberId: string;
  recipientMemberId: string;
  body: string;
  createdAt: string;
  readByRecipientAt: string | null;
};

type PeerMember = {
  id: string;
  username: string;
  platform?: string;
};

type MessageView = 'model' | 'members';

export function MemberMessageWidget({ secureToken, modelName }: { secureToken: string; modelName: string }) {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<MessageView>('model');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [peerMessages, setPeerMessages] = useState<PeerMessage[]>([]);
  const [body, setBody] = useState('');
  const [peerBody, setPeerBody] = useState('');
  const [sending, setSending] = useState(false);
  const [peerSending, setPeerSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PeerMember[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<PeerMember | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const peerListRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const peerSendingRef = useRef(false);
  const unreadCount = open ? 0 : messages.filter((message) => message.sender === 'model' && !message.readByMemberAt).length;
  const displayedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const displayedPeerMessages = useMemo(() => [...peerMessages].reverse(), [peerMessages]);

  async function refreshModelMessages(markRead = open && activeView === 'model') {
    const params = new URLSearchParams({ token: secureToken });
    if (markRead) params.set('markRead', '1');
    const response = await fetch(`/api/messages/member?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as { messages?: DirectMessage[] };
    setMessages((current) => {
      const optimisticMessages = current.filter((message) => message.id.startsWith('optimistic-'));
      const nextMessages = payload.messages ?? [];
      return sendingRef.current ? [...nextMessages, ...optimisticMessages] : nextMessages;
    });
  }

  async function refreshPeerMessages(peer = selectedPeer, markRead = open && activeView === 'members') {
    if (!peer) return;
    const params = new URLSearchParams({ token: secureToken, peerId: peer.id });
    if (markRead) params.set('markRead', '1');
    const response = await fetch(`/api/messages/member-peer?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as { messages?: PeerMessage[] };
    setPeerMessages((current) => {
      const optimisticMessages = current.filter((message) => message.id.startsWith('optimistic-'));
      const nextMessages = payload.messages ?? [];
      return peerSendingRef.current ? [...nextMessages, ...optimisticMessages] : nextMessages;
    });
  }

  useEffect(() => {
    void refreshModelMessages(open && activeView === 'model');
    const intervalId = window.setInterval(() => void refreshModelMessages(open && activeView === 'model'), open ? 3000 : 5000);
    return () => window.clearInterval(intervalId);
  }, [secureToken, open, activeView]);

  useEffect(() => {
    if (!selectedPeer || activeView !== 'members') return;
    void refreshPeerMessages(selectedPeer, open);
    const intervalId = window.setInterval(() => void refreshPeerMessages(selectedPeer, open), 3000);
    return () => window.clearInterval(intervalId);
  }, [secureToken, open, activeView, selectedPeer]);

  useEffect(() => {
    if (!open || activeView !== 'members') return;
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({ token: secureToken, q: query });
        const response = await fetch(`/api/messages/member-search?${params.toString()}`, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as { members?: PeerMember[] };
        setSearchResults(payload.members ?? []);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [secureToken, open, activeView, searchQuery]);

  useEffect(() => {
    if (!open || activeView !== 'model') return;
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [open, activeView, messages.length]);

  useEffect(() => {
    if (!open || activeView !== 'members') return;
    peerListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [open, activeView, peerMessages.length, selectedPeer]);

  async function submitModelMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = body.trim();
    if (!content) return;

    const optimisticMessage: DirectMessage = {
      id: `optimistic-${Date.now()}`,
      sender: 'member',
      body: content,
      createdAt: new Date().toISOString(),
      readByMemberAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticMessage]);
    setBody('');
    setSending(true);
    sendingRef.current = true;

    try {
      const response = await fetch('/api/messages/member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secureToken, body: content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Message non envoyé.');
      setMessages((current) =>
        current.some((message) => message.id === optimisticMessage.id)
          ? current.map((message) => (message.id === optimisticMessage.id ? payload.message : message))
          : [...current, payload.message],
      );
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
      setBody(content);
      toast.error((error as Error).message);
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  }

  async function submitPeerMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = peerBody.trim();
    if (!selectedPeer || !content) return;

    const optimisticMessage: PeerMessage = {
      id: `optimistic-${Date.now()}`,
      senderMemberId: 'current-member',
      recipientMemberId: selectedPeer.id,
      body: content,
      createdAt: new Date().toISOString(),
      readByRecipientAt: null,
    };

    setPeerMessages((current) => [...current, optimisticMessage]);
    setPeerBody('');
    setPeerSending(true);
    peerSendingRef.current = true;

    try {
      const response = await fetch('/api/messages/member-peer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secureToken, recipientMemberId: selectedPeer.id, body: content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Message non envoyé.');
      setPeerMessages((current) =>
        current.some((message) => message.id === optimisticMessage.id)
          ? current.map((message) => (message.id === optimisticMessage.id ? payload.message : message))
          : [...current, payload.message],
      );
    } catch (error) {
      setPeerMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
      setPeerBody(content);
      toast.error((error as Error).message);
    } finally {
      setPeerSending(false);
      peerSendingRef.current = false;
    }
  }

  function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  function selectPeer(peer: PeerMember) {
    setSelectedPeer(peer);
    setPeerMessages([]);
    setSearchQuery(peer.username);
    setSearchResults([]);
    void refreshPeerMessages(peer, true);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
      {open ? (
        <section className="flex h-[min(82svh,650px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-base-900 shadow-2xl shadow-black/60 sm:w-[30rem]">
          <header className="flex items-center justify-between gap-3 border-b border-base-800 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-50">Messages</p>
              <p className="truncate text-xs text-neutral-500">Support modèle et conversations membres</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-base-700 bg-base-850 p-2 text-neutral-300" aria-label="Fermer les messages">
              <X size={17} />
            </button>
          </header>

          <div className="grid grid-cols-2 gap-2 border-b border-base-800 bg-base-950/60 p-3">
            <button type="button" onClick={() => setActiveView('model')} className={`rounded-2xl px-3 py-2 text-xs font-bold transition-colors ${activeView === 'model' ? 'bg-accent-500 text-white' : 'bg-base-850 text-neutral-300'}`}>
              Modèle
            </button>
            <button type="button" onClick={() => setActiveView('members')} className={`rounded-2xl px-3 py-2 text-xs font-bold transition-colors ${activeView === 'members' ? 'bg-accent-500 text-white' : 'bg-base-850 text-neutral-300'}`}>
              Membres
            </button>
          </div>

          <SafetyNotice />

          {activeView === 'model' ? (
            <ModelConversation
              body={body}
              displayedMessages={displayedMessages}
              listRef={listRef}
              modelName={modelName}
              sending={sending}
              setBody={setBody}
              submit={submitModelMessage}
              submitOnEnter={submitOnEnter}
            />
          ) : (
            <PeerConversation
              displayedMessages={displayedPeerMessages}
              listRef={peerListRef}
              peerBody={peerBody}
              peerSending={peerSending}
              searchQuery={searchQuery}
              searchResults={searchResults}
              searching={searching}
              selectedPeer={selectedPeer}
              selectPeer={selectPeer}
              setPeerBody={setPeerBody}
              setSearchQuery={setSearchQuery}
              setSelectedPeer={setSelectedPeer}
              submit={submitPeerMessage}
              submitOnEnter={submitOnEnter}
            />
          )}
        </section>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="relative flex min-h-14 items-center gap-3 rounded-2xl border border-accent-300/40 bg-accent-500 px-5 py-3 text-left text-white shadow-2xl shadow-accent-500/30">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <MessageCircle size={23} />
          </span>
          <span>
            <span className="block text-sm font-black leading-tight">Messages</span>
            <span className="block text-xs text-white/75">Écrire au modèle ou à un membre</span>
          </span>
          {unreadCount > 0 ? (
            <span className="absolute -right-2 -top-2 min-w-6 rounded-full bg-cyan-400 px-2 py-1 text-xs font-black text-base-950">{unreadCount}</span>
          ) : null}
        </button>
      )}
    </div>
  );
}

function SafetyNotice() {
  return (
    <div className="border-b border-base-800 bg-base-950/80 px-4 py-3">
      <div className="flex gap-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-[11px] leading-5 text-cyan-50/85">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-cyan-200" />
        <p>Par sécurité, ne communiquez jamais d’informations personnelles, bancaires ou privées. PULSEROOM facilite les échanges mais ne peut être tenu responsable des informations partagées entre utilisateurs.</p>
      </div>
    </div>
  );
}

function ModelConversation({
  body,
  displayedMessages,
  listRef,
  modelName,
  sending,
  setBody,
  submit,
  submitOnEnter,
}: {
  body: string;
  displayedMessages: DirectMessage[];
  listRef: RefObject<HTMLDivElement | null>;
  modelName: string;
  sending: boolean;
  setBody: (value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  submitOnEnter: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <>
      <div className="border-b border-base-800 px-4 py-3">
        <p className="text-sm font-semibold text-neutral-50">Conversation avec {modelName}</p>
        <p className="text-xs text-neutral-500">Le modèle reçoit vos messages depuis son espace PULSEROOM.</p>
      </div>
      <form onSubmit={submit} className="sticky top-0 z-10 border-b border-base-800 bg-base-900 p-3 shadow-lg shadow-black/10">
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={submitOnEnter}
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
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-base-950/65 p-4">
        {displayedMessages.map((message) => {
          const mine = message.sender === 'member';
          return <MessageBubble key={message.id} body={message.body} createdAt={message.createdAt} mine={mine} />;
        })}
        {displayedMessages.length === 0 ? <p className="py-8 text-center text-sm text-neutral-500">Écrivez un message au modèle.</p> : null}
      </div>
    </>
  );
}

function PeerConversation({
  displayedMessages,
  listRef,
  peerBody,
  peerSending,
  searchQuery,
  searchResults,
  searching,
  selectedPeer,
  selectPeer,
  setPeerBody,
  setSearchQuery,
  setSelectedPeer,
  submit,
  submitOnEnter,
}: {
  displayedMessages: PeerMessage[];
  listRef: RefObject<HTMLDivElement | null>;
  peerBody: string;
  peerSending: boolean;
  searchQuery: string;
  searchResults: PeerMember[];
  searching: boolean;
  selectedPeer: PeerMember | null;
  selectPeer: (peer: PeerMember) => void;
  setPeerBody: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSelectedPeer: (peer: PeerMember | null) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  submitOnEnter: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <>
      <div className="border-b border-base-800 p-3">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Rechercher un membre par pseudo..." className="input-field h-11 w-full pl-9" />
        </label>
        {selectedPeer ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-accent-300/20 bg-accent-500/10 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-50">Conversation avec {selectedPeer.username}</p>
              <p className="truncate text-xs text-neutral-500">{selectedPeer.platform ?? 'Membre PULSEROOM'}</p>
            </div>
            <button type="button" onClick={() => setSelectedPeer(null)} className="rounded-xl border border-base-700 px-3 py-2 text-xs font-bold text-neutral-300">
              Changer
            </button>
          </div>
        ) : (
          <div className="mt-3 max-h-36 overflow-y-auto rounded-2xl border border-base-800 bg-base-950">
            {searching ? <p className="px-3 py-3 text-xs text-neutral-500">Recherche...</p> : null}
            {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 ? <p className="px-3 py-3 text-xs text-neutral-500">Aucun membre trouvé.</p> : null}
            {searchResults.map((peer) => (
              <button key={peer.id} type="button" onClick={() => selectPeer(peer)} className="flex w-full items-center gap-3 border-b border-base-800 px-3 py-3 text-left last:border-b-0 hover:bg-base-850">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-200">
                  <UserRound size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-neutral-100">{peer.username}</span>
                  <span className="block truncate text-xs text-neutral-500">{peer.platform}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="sticky top-0 z-10 border-b border-base-800 bg-base-900 p-3 shadow-lg shadow-black/10">
        <div className="flex gap-2">
          <textarea
            value={peerBody}
            onChange={(event) => setPeerBody(event.target.value)}
            onKeyDown={submitOnEnter}
            disabled={!selectedPeer}
            placeholder={selectedPeer ? 'Votre message...' : 'Choisissez un membre...'}
            className="input-field min-h-12 flex-1 resize-none py-3"
            rows={1}
            maxLength={1000}
          />
          <button type="submit" disabled={!selectedPeer || peerSending || !peerBody.trim()} className="btn-accent h-12 shrink-0 px-4" aria-label="Envoyer">
            <Send size={17} />
          </button>
        </div>
      </form>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-base-950/65 p-4">
        {displayedMessages.map((message) => {
          const mine = message.senderMemberId === 'current-member' || message.recipientMemberId === selectedPeer?.id;
          return <MessageBubble key={message.id} body={message.body} createdAt={message.createdAt} mine={mine} />;
        })}
        {selectedPeer && displayedMessages.length === 0 ? <p className="py-8 text-center text-sm text-neutral-500">Aucun message avec ce membre.</p> : null}
        {!selectedPeer ? <p className="py-8 text-center text-sm text-neutral-500">Recherchez un pseudo pour démarrer une conversation.</p> : null}
      </div>
    </>
  );
}

function MessageBubble({ body, createdAt, mine }: { body: string; createdAt: string; mine: boolean }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? 'bg-accent-500 text-white' : 'border border-base-800 bg-base-900 text-neutral-200'}`}>
        <p className="whitespace-pre-wrap break-words">{body}</p>
        <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-neutral-500'}`}>{formatMessageTime(createdAt)}</p>
      </div>
    </div>
  );
}

function formatMessageTime(value: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' }).format(new Date(value));
}
