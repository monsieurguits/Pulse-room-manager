'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Radio, ShieldCheck, Vibrate } from 'lucide-react';

interface OverlayEvent {
  id: string;
  type: 'control-started' | 'control-stopped';
  message: string;
  username: string;
  toyName: string | null;
  createdAt: string;
}

interface OverlayLiveState {
  active: boolean;
  username: string | null;
  toyName: string | null;
  intensity: number;
  pattern: number[] | null;
  patternStepMs: number | null;
  updatedAt: string | null;
}

export function ObsOverlay({ token }: { token: string }) {
  const [activeEvent, setActiveEvent] = useState<OverlayEvent | null>(null);
  const [liveState, setLiveState] = useState<OverlayLiveState | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const sinceRef = useRef(new Date().toISOString());
  const seenRef = useRef(new Set<string>());
  const hideTimerRef = useRef<number | null>(null);

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

        const payload = (await response.json()) as { events?: OverlayEvent[]; live?: OverlayLiveState };
        setIsInvalid(false);
        setLiveState(payload.live ?? null);

        for (const event of payload.events ?? []) {
          sinceRef.current = event.createdAt;
          if (seenRef.current.has(event.id)) continue;
          seenRef.current.add(event.id);
          showEvent(event);
        }

        if (!activeEvent && payload.live?.active && payload.live.username) {
          setActiveEvent({
            id: `live-${payload.live.updatedAt ?? payload.live.username}`,
            type: 'control-started',
            message: `${payload.live.username} a pris le contrôle du jouet ${payload.live.toyName ?? 'Lovense'} depuis son espace FanClub.`,
            username: payload.live.username,
            toyName: payload.live.toyName,
            createdAt: payload.live.updatedAt ?? new Date().toISOString(),
          });
        }
      } catch {
        // OBS garde l'overlay chargé même si le réseau a une micro-coupure.
      }
    }

    function showEvent(event: OverlayEvent) {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      setActiveEvent(event);

      if (event.type === 'control-stopped') {
        hideTimerRef.current = window.setTimeout(() => {
          setActiveEvent(null);
          hideTimerRef.current = null;
        }, 10_000);
      }
    }

    void poll();
    const interval = window.setInterval(() => {
      if (!stopped) void poll();
    }, 800);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [activeEvent, token]);

  const isStarted = activeEvent?.type === 'control-started';

  return (
    <main className="min-h-screen bg-transparent p-8 text-white">
      <div className="fixed left-1/2 top-10 w-[min(94vw,860px)] -translate-x-1/2">
        <div
          className={[
            'transform-gpu transition-all duration-500',
            activeEvent ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-5 opacity-0 scale-95',
          ].join(' ')}
        >
          <div className="relative overflow-hidden rounded-[26px] border-2 border-white/80 bg-[#05050a]/92 px-7 py-5 shadow-[0_0_0_4px_rgba(255,45,135,0.55),0_26px_90px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,45,135,0.38),rgba(0,218,255,0.24)),radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.18),transparent_28%)]" />
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#ff2d87] via-[#b45cff] to-[#00d8ff]" />
            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-[#ff2d87] ring-4 ring-[#00d8ff]/35">
                {isStarted ? <Vibrate size={34} /> : <ShieldCheck size={32} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                  <Radio size={14} />
                  <span>{isStarted ? 'Contrôle en direct' : 'Contrôle terminé'}</span>
                </div>
                <p className="text-balance text-2xl font-black leading-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,1)] sm:text-3xl">
                  {activeEvent?.message}
                </p>
                {isStarted && liveState?.intensity ? (
                  <p className="mt-2 text-sm font-bold text-white/90">Puissance actuelle : {liveState.intensity}/20</p>
                ) : null}
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

export function ObsCurveOverlay({ token }: { token: string }) {
  const [liveState, setLiveState] = useState<OverlayLiveState | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!token) return;
    let stopped = false;

    async function poll() {
      const params = new URLSearchParams({ token, after: new Date(Date.now() - 1000).toISOString() });
      const response = await fetch(`/api/overlay/events?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as { live?: OverlayLiveState };
      if (!stopped) setLiveState(payload.live ?? null);
    }

    void poll();
    const interval = window.setInterval(() => void poll(), 600);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    let frameId = 0;
    const startedAt = performance.now();
    const animate = (now: number) => {
      setPhase((now - startedAt) / (liveState?.patternStepMs || 420));
      frameId = window.requestAnimationFrame(animate);
    };
    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [liveState?.patternStepMs]);

  const values = buildCurveValues(liveState, phase);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 680;
      const y = 170 - (value / 20) * 130;
      return `${x},${y}`;
    })
    .join(' ');

  const active = Boolean(liveState?.active);

  return (
    <main className="min-h-screen bg-transparent p-8 text-white">
      <div className="fixed bottom-10 left-1/2 w-[min(94vw,760px)] -translate-x-1/2">
        <div className={['transition-all duration-500', active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'].join(' ')}>
          <div className="relative overflow-hidden rounded-[26px] border border-white/45 bg-white/12 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.65),0_0_0_2px_rgba(255,45,135,0.28)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,45,135,0.22),rgba(0,216,255,0.14))]" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff2d87] text-white shadow-[0_0_28px_rgba(255,45,135,0.75)]">
                    <Activity size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">Puissance live</p>
                    <p className="truncate text-lg font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                      {liveState?.username ?? 'Membre'} contrôle {liveState?.toyName ?? 'Lovense'}
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-white/35 bg-black/35 px-4 py-2 font-mono text-xl font-black text-white">
                  {liveState?.intensity ?? 0}/20
                </div>
              </div>

              <svg viewBox="0 0 680 190" className="h-44 w-full overflow-visible">
                <defs>
                  <linearGradient id="pulseLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#ff2d87" />
                    <stop offset="55%" stopColor="#ff5fb1" />
                    <stop offset="100%" stopColor="#00d8ff" />
                  </linearGradient>
                  <filter id="pulseGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {[0, 1, 2, 3].map((line) => (
                  <line key={line} x1="0" x2="680" y1={40 + line * 43} y2={40 + line * 43} stroke="rgba(255,255,255,0.16)" />
                ))}
                <polyline points={points} fill="none" stroke="rgba(255,45,135,0.28)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={points} fill="none" stroke="url(#pulseLine)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter="url(#pulseGlow)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function buildCurveValues(liveState: OverlayLiveState | null, phase: number): number[] {
  const pattern = liveState?.pattern?.length ? liveState.pattern : null;
  const fallback = liveState?.active ? liveState.intensity : 0;

  return Array.from({ length: 42 }, (_, index) => {
    if (!pattern) return fallback;
    const position = phase + index * 0.16;
    const currentIndex = Math.floor(position) % pattern.length;
    const nextIndex = (currentIndex + 1) % pattern.length;
    const progress = position - Math.floor(position);
    const current = pattern[currentIndex] ?? fallback;
    const next = pattern[nextIndex] ?? current;
    return current + (next - current) * (progress * progress * (3 - 2 * progress));
  });
}
