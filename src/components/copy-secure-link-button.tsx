'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function CopySecureLinkButton({ token }: { token: string }) {
  return (
    <button
      className="btn-secondary"
      onClick={() => {
        const url = `${window.location.origin}/control/${token}`;
        navigator.clipboard.writeText(url);
        toast.success('Lien sécurisé copié.');
      }}
    >
      <Copy size={16} />
      Copier le lien
    </button>
  );
}
