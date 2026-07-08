'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { buildMemberInviteMessage } from '@/lib/member-invite-message';

export function CopySecureLinkButton({ token, username }: { token: string; username: string }) {
  return (
    <button
      className="btn-secondary"
      onClick={() => {
        const url = `${window.location.origin}/control/${token}`;
        navigator.clipboard.writeText(buildMemberInviteMessage({ username, url }));
        toast.success('Message avec lien copié.');
      }}
    >
      <Copy size={16} />
      Copier le message
    </button>
  );
}
