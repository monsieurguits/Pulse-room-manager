'use client';

import { useEffect, useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function OverlayLinkCard({ token }: { token: string }) {
  const overlayPath = `/overlay/obs?token=${token}`;
  const previewHref = overlayPath;
  const [displayUrl, setDisplayUrl] = useState(overlayPath);

  useEffect(() => {
    setDisplayUrl(`${window.location.origin}${overlayPath}`);
  }, [overlayPath]);

  function copyOverlayLink() {
    navigator.clipboard.writeText(`${window.location.origin}${overlayPath}`);
    toast.success('Lien overlay OBS copié.');
  }

  return (
    <div className="rounded-2xl border border-base-800 bg-base-950/70 p-4">
      <p className="text-xs text-neutral-500">URL à coller dans OBS</p>
      <div className="mt-2 rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-xs text-neutral-300">
        <span className="block truncate">{displayUrl}</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={copyOverlayLink} className="btn-secondary justify-center">
          <Copy size={16} />
          Copier
        </button>
        <a href={previewHref} target="_blank" rel="noreferrer" className="btn-secondary justify-center">
          <ExternalLink size={16} />
          Aperçu
        </a>
      </div>
    </div>
  );
}
