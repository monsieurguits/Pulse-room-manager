'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';

export function QrPairingPanel({ memberId }: { memberId: string }) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/lovense/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erreur lors de la génération du QR code.');
      setQrImage(json.qrImageUrl as string);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card flex flex-col items-center gap-5 p-8">
      {qrImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrImage} alt="QR Code d'appairage Lovense" className="h-64 w-64 rounded-xl bg-white p-3" />
      ) : (
        <div className="flex h-64 w-64 items-center justify-center rounded-xl border border-dashed border-base-700 text-neutral-500">
          Aucun QR généré
        </div>
      )}

      <p className="text-center text-sm text-neutral-400">
        Scannez ce QR code avec l&apos;application Lovense Connect / Remote pour appairer le jouet de ce membre.
      </p>

      <button onClick={generate} disabled={loading} className="btn-accent">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        {qrImage ? 'Régénérer le QR code' : 'Générer le QR code'}
      </button>
    </div>
  );
}
