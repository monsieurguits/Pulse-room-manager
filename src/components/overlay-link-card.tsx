'use client';

import { useEffect, useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function OverlayLinkCard({ token }: { token: string }) {
  const announcementPath = `/overlay/obs?token=${token}`;
  const curvePath = `/overlay/obs?token=${token}&mode=curve`;
  const [displayUrl, setDisplayUrl] = useState(announcementPath);
  const [curveDisplayUrl, setCurveDisplayUrl] = useState(curvePath);

  useEffect(() => {
    setDisplayUrl(`${window.location.origin}${announcementPath}`);
    setCurveDisplayUrl(`${window.location.origin}${curvePath}`);
  }, [announcementPath, curvePath]);

  function copyOverlayLink(path: string, label: string) {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    toast.success(`${label} copié.`);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-base-800 bg-base-950/70 p-4">
      <div>
        <p className="text-xs text-neutral-500">Overlay annonce contrôle</p>
        <div className="mt-2 rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-xs text-neutral-300">
          <span className="block truncate">{displayUrl}</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => copyOverlayLink(announcementPath, 'Lien annonce OBS')} className="btn-secondary justify-center">
            <Copy size={16} />
            Copier
          </button>
          <a href={announcementPath} target="_blank" rel="noreferrer" className="btn-secondary justify-center">
            <ExternalLink size={16} />
            Aperçu
          </a>
        </div>
      </div>

      <div className="border-t border-base-800 pt-4">
        <p className="text-xs text-neutral-500">Overlay courbe puissance</p>
        <div className="mt-2 rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-xs text-neutral-300">
          <span className="block truncate">{curveDisplayUrl}</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => copyOverlayLink(curvePath, 'Lien courbe OBS')} className="btn-secondary justify-center">
            <Copy size={16} />
            Copier
          </button>
          <a href={curvePath} target="_blank" rel="noreferrer" className="btn-secondary justify-center">
            <ExternalLink size={16} />
            Aperçu
          </a>
        </div>
      </div>
    </div>
  );
}
