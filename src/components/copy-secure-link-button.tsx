'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { buildMemberInviteMessage } from '@/lib/member-invite-message';

export function CopySecureLinkButton({ username, accessCode }: { username: string; accessCode: string | null }) {
  return (
    <button
      className="btn-secondary"
      onClick={() => {
        navigator.clipboard.writeText(buildMemberInviteMessage({ username, accessCode }));
        toast.success('Message avec code copié.');
      }}
    >
      <Copy size={16} />
      Copier le message
    </button>
  );
}
