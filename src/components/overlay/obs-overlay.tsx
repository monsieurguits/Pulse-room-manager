'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Radio, ShieldCheck, Vibrate } from 'lucide-react';

interface OverlayEvent {
  id: string;
  type: 'control-started' | 'control-stopped';
  message: string;
  username: string;
  toyName: string | null;
  createdAt: string;
}

export function ObsOverlay({ token }: { token: string }) {
  const [activeEvent, setActiveEvent] = useState<OverlayEvent | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const sinceRef = useRef(new Date().toISOString());
  const seenRef = useRef(new Set<string>());
  const queueRef = useRef<OverlayEvent[]>([]);
  const isDisplayingRef = useRef(false);

  const statusText = useMemo(() => {
    if (!token) return 'Token overlay manquant';
    if (isInvalid) return 'Overlay OBS non disponible';
    return 'Overlay PULSEROOM actif';
  }, [isInvalid, token]);

  useEffect(() => {
    if (!token) {
      setIsInvalid(true);
      return;
    }

    let stopped = false;

    async function poll() {
      try {
        const params = new URLSearchParams({ token, after: sinceRef.current });
        const response = await fetch(`/api/overlay/events?${params.toString()}`, { cache: 'no-store' });

        if (!response.ok) {
          setIsInvalid(response.status === 401 || response.status === 404);
          return;
        }

        const payload = (await response.json()) as { events?: OverlayEvent[] };
        setIsInvalid(false);

        for (const event of payload.events ?? []) {
          sinceRef.current = event.createdAt;
          if (seenRef.current.has(event.id)) continue;
          seenRef.current.add(event.id);
          queueRef.current.push(event);
        }

        showNext();
      } catch {
        // OBS garde l'overlay chargé même si le réseau a une micro-coupure.
      }
    }

    function showNext() {
      if (isDisplayingRef.current) return;
      const next = queueRef.current.shift();
      if (!next) return;

      isDisplayingRef.current = true;
      setActiveEvent(next);

      window.setTimeout(() => {
        setActiveEvent(null);
        window.setTimeout(() => {
          isDisplayingRef.current = false;
          showNext();
        }, 350);
      }, 6200);
    }

    void poll();
    const interval = window.setInterval(() => {
      if (!stopped) void poll();
    }, 1800);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [token]);

  const isStarted = activeEvent?.type === 'control-started';

  return (
    <main className="min-h-screen bg-transparent p-8 text-white">
      <div className="fixed left-1/2 top-10 w-[min(92vw,760px)] -translate-x-1/2">
        <div
          className={[
            'transform-gpu transition-all duration-500',
            activeEvent ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-5 opacity-0 scale-95',
          ].join(' ')}
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/18 bg-[#070710]/72 px-7 py-5 shadow-[0_26px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,46,109,0.34),transparent_34%),radial-gradient(circle_at_78%_60%,rgba(0,218,255,0.24),transparent_38%)]" />
            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/15">
                {isStarted ? <Vibrate size={34} /> : <ShieldCheck size={32} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                  <Radio size={14} />
                  <span>{isStarted ? 'Controle en direct' : 'Controle termine'}</span>
                </div>
                <p className="text-balance text-2xl font-black leading-tight text-white drop-shadow sm:text-3xl">
                  {activeEvent?.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!activeEvent && (
          <div className="mt-2 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-white/0">
            {statusText}
          </div>
        )}
      </div>
    </main>
  );
}
