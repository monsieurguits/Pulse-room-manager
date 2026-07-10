'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';

export function QrPairingPanel({
  memberId,
  initialQrImage = null,
  initialConnectionCode = null,
  initialAccessCode = null,
}: {
  memberId: string;
  initialQrImage?: string | null;
  initialConnectionCode?: string | null;
  initialAccessCode?: string | null;
}) {
  const [qrImage, setQrImage] = useState<string | null>(initialQrImage);
  const [connectionCode, setConnectionCode] = useState<string | null>(initialConnectionCode);
  const [accessCode, setAccessCode] = useState<string | null>(initialAccessCode);
  const [loading, setLoading] = useState(false);

  async function generate(forceRefresh = false) {
    setLoading(true);
    try {
      const res = await fetch('/api/lovense/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, forceRefresh }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erreur lors de la génération du QR code.');
      setQrImage(json.qrImageUrl as string);
      setConnectionCode(typeof json.connectionCode === 'string' && json.connectionCode ? json.connectionCode : null);
      setAccessCode(typeof json.accessCode === 'string' && json.accessCode ? json.accessCode : null);
      if (forceRefresh && json.emailWarning) {
        toast.warning(`Nouveau QR généré, mais email non envoyé : ${json.emailWarning}`);
      } else if (forceRefresh && json.emailSent) {
        toast.success('Nouveau QR généré et nouveau code envoyé au membre.');
      } else {
        toast.success(forceRefresh ? 'Nouveau QR code Lovense généré.' : 'QR code Lovense généré.');
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card flex flex-col items-center gap-5 p-4 sm:p-8">
      {qrImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrImage} alt="QR Code d'appairage Lovense" className="aspect-square w-full max-w-64 rounded-xl bg-white p-3" />
      ) : (
        <div className="flex aspect-square w-full max-w-64 items-center justify-center rounded-xl border border-dashed border-base-700 text-center text-neutral-500">
          Aucun QR généré
        </div>
      )}

      <p className="text-center text-sm text-neutral-400">
        Scannez ce QR code avec l&apos;application Lovense Connect / Remote pour appairer le jouet de ce membre.
      </p>

      {connectionCode ? (
        <div className="w-full rounded-2xl border border-accent-500/25 bg-accent-500/10 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Code de connexion Lovense</p>
          <p className="mt-2 font-mono text-2xl font-black text-neutral-50">{connectionCode}</p>
        </div>
      ) : null}

      {accessCode ? (
        <div className="w-full rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Code FanClub /join</p>
          <p className="mt-2 font-mono text-2xl font-black text-neutral-50">{accessCode}</p>
        </div>
      ) : null}

      <div className="grid w-full gap-3 sm:grid-cols-2">
        <button onClick={() => generate(false)} disabled={loading} className="btn-secondary justify-center">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Générer
        </button>
        <button onClick={() => generate(true)} disabled={loading} className="btn-accent justify-center">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Nouveau QR
        </button>
      </div>

      <p className="text-center text-xs leading-5 text-neutral-500">
        Si Lovense indique que le QR code a expiré, utilisez Nouveau QR. Le crédit, les dates et l’historique du membre ne
        seront pas modifiés. Son code FanClub /join sera renouvelé.
      </p>
    </div>
  );
}
