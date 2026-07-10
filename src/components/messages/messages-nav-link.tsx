'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type Conversation = { unreadCount: number };

export function MessagesNavLink({ initialUnread, compact = false }: { initialUnread: number; compact?: boolean }) {
  const [unread, setUnread] = useState(initialUnread);

  useEffect(() => {
    let stopped = false;

    async function refresh() {
      try {
        const response = await fetch('/api/messages/admin', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as { conversations?: Conversation[] };
        const internalResponse = await fetch('/api/messages/internal', { cache: 'no-store' });
        const internalPayload = internalResponse.ok
          ? ((await internalResponse.json()) as { unreadByContact?: { count: number }[] })
          : { unreadByContact: [] };
        const memberTotal = (payload.conversations ?? []).reduce((sum, conversation) => sum + conversation.unreadCount, 0);
        const internalTotal = (internalPayload.unreadByContact ?? []).reduce((sum, contact) => sum + contact.count, 0);
        const total = memberTotal + internalTotal;
        if (!stopped) setUnread(total);
      } catch {
        // Le menu reste utilisable même si une requête de badge échoue.
      }
    }

    const intervalId = window.setInterval(() => void refresh(), 4000);
    void refresh();

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, []);

  if (compact) {
    return (
      <Link
        href="/messages"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-base-800 bg-base-950 px-3 py-2 text-xs font-medium text-neutral-300"
      >
        <MessageCircle size={15} />
        Messages
        {unread > 0 ? <span className="ml-1 rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-black text-white">{unread}</span> : null}
      </Link>
    );
  }

  return (
    <Link href="/messages" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-base-800 hover:text-accent-400">
      <MessageCircle size={18} />
      Messages
      {unread > 0 ? <span className="ml-auto rounded-full bg-accent-500 px-2 py-0.5 text-xs font-black text-white">{unread}</span> : null}
    </Link>
  );
}
