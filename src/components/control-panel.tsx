'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Activity,
  BatteryMedium,
  Clock3,
  Gauge,
  Pause,
  Play,
  PlayCircle,
  ShieldCheck,
  Square,
  TimerReset,
  Waves,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useRealtimeMember, type RealtimeMemberState } from '@/hooks/use-realtime-member';
import { MemberTierBadge } from '@/components/member-tier-badge';
import { formatDuration, formatEstimatedEnd } from '@/lib/utils';
import type { LovenseToy } from '@/types';

const LOVENSE_PRESETS = [
  { label: 'Pulse', name: 'pulse', strengths: [4, 20, 4, 20, 4, 20], stepMs: 520 },
  { label: 'Wave', name: 'wave', strengths: [2, 5, 9, 14, 18, 20, 18, 14, 9, 5], stepMs: 420 },
  { label: 'Fireworks', name: 'fireworks', strengths: [0, 4, 12, 20, 6, 16, 20, 3, 18, 0], stepMs: 320 },
  { label: 'Earthquake', name: 'earthquake', strengths: [18, 20, 15, 20, 17, 19], stepMs: 260 },
] as const;

const CUSTOM_PATTERNS = [
  { label: 'Montée', rule: 'V:1;F:v;S:500#', strength: '2;5;8;11;14;17;20', stepMs: 500 },
  { label: 'Vagues', rule: 'V:1;F:v;S:420#', strength: '2;6;10;15;20;15;10;6;2;0', stepMs: 420 },
  { label: 'Impulsions', rule: 'V:1;F:v;S:360#', strength: '20;6;18;5;15;4;0', stepMs: 360 },
] as const;

interface PatternPreview {
  label: string;
  strengths: number[];
  stepMs: number;
}

function parseStrengths(strength: string): number[] {
  return strength
    .split(';')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.min(20, Math.max(0, value)));
}

function smoothstep(progress: number): number {
  return progress * progress * (3 - 2 * progress);
}

function interpolatePattern(strengths: number[], position: number): number {
  if (strengths.length === 0) return 0;
  if (strengths.length === 1) return strengths[0] ?? 0;

  const currentIndex = Math.floor(position) % strengths.length;
  const nextIndex = (currentIndex + 1) % strengths.length;
  const current = strengths[currentIndex] ?? 0;
  const next = strengths[nextIndex] ?? current;
  const progress = smoothstep(position - Math.floor(position));

  return current + (next - current) * progress;
}

interface Props {
  memberId: string;
  secureToken: string;
  username: string;
  platform: string;
  active: boolean;
  toys: LovenseToy[];
  memberSince: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  currentMonthStartDate: string;
  currentMonthEndDate: string;
  initial: RealtimeMemberState & { weeklyCredit: number };
}

export function ControlPanel({
  memberId,
  secureToken,
  username,
  platform,
  active,
  toys,
  memberSince,
  subscriptionStartDate,
  subscriptionEndDate,
  currentMonthStartDate,
  currentMonthEndDate,
  initial,
}: Props) {
  const [controlClientId, setControlClientId] = useState<string | null>(null);
  const realtime = useRealtimeMember(memberId, initial, controlClientId);
  const [isPending, startTransition] = useTransition();
  const [paused, setPaused] = useState(false);
  const [intensity, setIntensity] = useState(10);
  const [activePattern, setActivePattern] = useState<PatternPreview | null>(null);
  const [visualPosition, setVisualPosition] = useState(0);
  const [selectedToyId, setSelectedToyId] = useState<string>('all');
  const intensitySendTimer = useRef<number | null>(null);
  const intensitySendInFlight = useRef(false);
  const queuedIntensity = useRef<number | null>(null);
  const hasControl = realtime.isControlling && realtime.canControl;
  const effectivePaused = hasControl && paused;
  const previewStrengths = activePattern?.strengths.length ? activePattern.strengths : [intensity];
  const previewValue = activePattern && hasControl && !effectivePaused
    ? interpolatePattern(previewStrengths, visualPosition)
    : intensity;
  const activeVisualStep = Math.floor(visualPosition) % previewStrengths.length;
  const previewPct = Math.min(100, Math.max(0, (previewValue / 20) * 100));

  const progressPct = initial.weeklyCredit > 0
    ? Math.min(100, Math.max(0, (realtime.remainingCredit / initial.weeklyCredit) * 100))
    : 0;
  const connectedToys = toys.filter((toy) => toy.status === 1);
  const selectableToys = connectedToys.length > 0 ? connectedToys : toys;
  const commandToyId = selectedToyId === 'all' ? undefined : selectedToyId;
  const selectedToyLabel = selectedToyId === 'all'
    ? selectableToys.length > 1
      ? 'Tous les jouets'
      : selectableToys[0]?.nickName || selectableToys[0]?.name || 'Jouet'
    : selectableToys.find((toy) => toy.id === selectedToyId)?.nickName
      || selectableToys.find((toy) => toy.id === selectedToyId)?.name
      || 'Jouet';

  useEffect(() => {
    const storageKey = `vulse-control-client:${secureToken}`;
    const existing = window.localStorage.getItem(storageKey);
    const next = existing ?? crypto.randomUUID();

    if (!existing) {
      window.localStorage.setItem(storageKey, next);
    }

    setControlClientId(next);
  }, [secureToken]);

  useEffect(() => {
    if (!activePattern || !hasControl || effectivePaused) return;

    let frameId = 0;
    const startedAt = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startedAt;
      setVisualPosition(elapsed / activePattern.stepMs);
      frameId = window.requestAnimationFrame(animate);
    };

    setVisualPosition(0);
    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [activePattern, effectivePaused, hasControl]);

  useEffect(() => {
    return () => {
      if (intensitySendTimer.current) {
        window.clearTimeout(intensitySendTimer.current);
      }
    };
  }, []);

  async function post(path: string, body: Record<string, unknown> = {}) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secureToken, controlClientId, toyId: commandToyId, ...body }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? json.result?.message ?? 'Une erreur est survenue.');
    return json;
  }

  async function call(path: string, body: Record<string, unknown> = {}) {
    startTransition(async () => {
      try {
        await post(path, body);
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  function handleStart() {
    startTransition(async () => {
      try {
        await post('/api/control/start');
        await post('/api/lovense/vibrate', { level: intensity, timeSec: 0 });
        setPaused(false);
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  const handleStop = () => {
    setActivePattern(null);
    call('/api/control/stop');
  };

  const handleIntensityChange = (level: number) => {
    setActivePattern(null);
    setIntensity(level);

    if (hasControl && !effectivePaused) {
      queueIntensityCommand(level);
    }
  };

  async function flushIntensityCommand() {
    if (intensitySendInFlight.current) return;

    const level = queuedIntensity.current;
    if (level === null) return;

    queuedIntensity.current = null;
    intensitySendInFlight.current = true;

    try {
      await post('/api/lovense/vibrate', { level, timeSec: 0 });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      intensitySendInFlight.current = false;

      if (queuedIntensity.current !== null) {
        intensitySendTimer.current = window.setTimeout(() => {
          intensitySendTimer.current = null;
          void flushIntensityCommand();
        }, 90);
      }
    }
  }

  function queueIntensityCommand(level: number, immediate = false) {
    queuedIntensity.current = level;

    if (immediate) {
      if (intensitySendTimer.current) {
        window.clearTimeout(intensitySendTimer.current);
        intensitySendTimer.current = null;
      }
      void flushIntensityCommand();
      return;
    }

    if (intensitySendTimer.current || intensitySendInFlight.current) return;

    intensitySendTimer.current = window.setTimeout(() => {
      intensitySendTimer.current = null;
      void flushIntensityCommand();
    }, 90);
  }

  function commitIntensity() {
    if (hasControl && !effectivePaused) {
      queueIntensityCommand(intensity, true);
    }
  }

  const handlePreset = (preset: (typeof LOVENSE_PRESETS)[number]) => {
    setActivePattern({ label: preset.label, strengths: [...preset.strengths], stepMs: preset.stepMs });
    call('/api/lovense/pattern', {
      rule: `V:1;F:v;S:${preset.stepMs}#`,
      strength: preset.strengths.join(';'),
      timeSec: 0,
    });
    setPaused(false);
  };

  const handlePattern = (pattern: (typeof CUSTOM_PATTERNS)[number]) => {
    setActivePattern({ label: pattern.label, strengths: parseStrengths(pattern.strength), stepMs: pattern.stepMs });
    call('/api/lovense/pattern', { rule: pattern.rule, strength: pattern.strength, timeSec: 0 });
    setPaused(false);
  };

  async function handlePauseResume() {
    startTransition(async () => {
      try {
        if (!effectivePaused) {
          await post('/api/lovense/stop');
          setPaused(true);
          toast.info('Contrôle en pause.');
        } else {
          await post('/api/lovense/vibrate', { level: intensity, timeSec: 0 });
          setActivePattern(null);
          setPaused(false);
          toast.info('Contrôle repris.');
        }
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  if (!active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-950 p-6">
        <div className="card max-w-sm p-8 text-center">
          <p className="text-lg font-semibold text-neutral-100">Accès suspendu</p>
          <p className="mt-2 text-sm text-neutral-400">Ce lien de contrôle est actuellement inactif.</p>
        </div>
      </div>
    );
  }

  const sessionLabel = realtime.isWaiting ? "Liste d'attente" : realtime.isControlling ? 'En cours' : 'Libre';
  const sessionClassName = realtime.isWaiting
    ? 'border-amber-500/30 bg-amber-500/12 text-amber-200'
    : realtime.isControlling
      ? 'border-accent-500/35 bg-accent-500/12 text-accent-400'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300';
  const deviceLabel = realtime.connected ? 'Connecté' : 'Déconnecté';
  const deviceClassName = realtime.connected
    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
    : 'border-red-500/25 bg-red-500/10 text-red-300';
  const creditLabel = `${formatDuration(realtime.remainingCredit)} restant`;
  const memberSinceLabel = formatDisplayDate(memberSince);
  const subscriptionPeriodLabel = `${formatDisplayDate(subscriptionStartDate)} - ${formatDisplayDate(subscriptionEndDate)}`;
  const currentMonthPeriodLabel = `${formatDisplayDate(currentMonthStartDate)} - ${formatDisplayDate(currentMonthEndDate)}`;

  return (
    <main className="min-h-screen bg-base-950 px-4 py-6 text-neutral-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <section className="overflow-hidden rounded-[28px] border border-base-700 bg-base-900 shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative overflow-hidden border-b border-base-800 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-500 via-fuchsia-300 to-cyan-300" />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-neutral-500">Accès membre</p>
                  <h1 className="mt-2 truncate text-4xl font-black text-neutral-50 sm:text-5xl">{username}</h1>
                  <p className="mt-2 text-sm font-medium text-neutral-400">{platform}</p>
                </div>
                <MemberTierBadge weeklyCredit={initial.weeklyCredit} size="large" className="mx-0 self-start sm:self-center" />
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3 lg:grid-cols-1 lg:p-6">
              <StatusPill icon={<ShieldCheck size={16} />} label="Session" value={sessionLabel} className={sessionClassName} />
              <StatusPill
                icon={realtime.connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                label="Appareil"
                value={deviceLabel}
                className={deviceClassName}
              />
              <StatusPill
                icon={<BatteryMedium size={16} />}
                label="Batterie"
                value={realtime.battery !== null ? `${realtime.battery}%` : 'Non disponible'}
                className="border-base-700 bg-base-850 text-neutral-300"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <InfoTile label="Membre depuis" value={memberSinceLabel} />
          <InfoTile label="Abonnement" value={subscriptionPeriodLabel} />
          <InfoTile label="Mois en cours" value={currentMonthPeriodLabel} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[28px] border border-base-700 bg-base-900 p-5 shadow-2xl sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={<Clock3 size={18} />} label="Temps écoulé" value={formatDuration(realtime.elapsedSeconds)} />
              <MetricCard icon={<TimerReset size={18} />} label="Crédit" value={creditLabel} />
              <MetricCard
                icon={<Activity size={18} />}
                label="Cible"
                value={selectedToyLabel}
              />
              <MetricCard
                icon={<Activity size={18} />}
                label="Fin"
                value={realtime.isControlling ? formatEstimatedEnd(realtime.remainingCredit) : '--:--'}
              />
            </div>

            {selectableToys.length > 1 && (
              <div className="mt-6 rounded-2xl border border-base-800 bg-base-950/70 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-neutral-200">Jouet contrôlé</span>
                  <span className="font-mono text-xs text-neutral-500">{selectedToyLabel}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setSelectedToyId('all')}
                    disabled={hasControl}
                    className={selectedToyId === 'all' ? 'btn-accent min-h-11 px-3 py-2 text-xs' : 'btn-secondary min-h-11 px-3 py-2 text-xs'}
                  >
                    {selectableToys.length === 2 ? 'Les deux' : 'Tous'}
                  </button>
                  {selectableToys.map((toy, index) => (
                    <button
                      key={toy.id}
                      type="button"
                      onClick={() => setSelectedToyId(toy.id)}
                      disabled={hasControl}
                      className={selectedToyId === toy.id ? 'btn-accent min-h-11 px-3 py-2 text-xs' : 'btn-secondary min-h-11 px-3 py-2 text-xs'}
                    >
                      {toy.nickName || toy.name || `Jouet ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-base-800 bg-base-950/70 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-neutral-200">Crédit hebdomadaire</span>
                <span className="font-mono text-xs text-neutral-500">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-base-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-600 via-accent-400 to-cyan-300 transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-base-800 bg-base-950/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
                  <Gauge size={17} className="text-accent-400" />
                  Intensité
                </span>
                <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 font-mono text-sm text-accent-200">
                  {intensity}/20
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={intensity}
                onChange={(event) => handleIntensityChange(Number(event.target.value))}
                onPointerUp={commitIntensity}
                onTouchEnd={commitIntensity}
                onMouseUp={commitIntensity}
                disabled={effectivePaused}
                className="intensity-slider w-full"
                style={{ ['--intensity-progress' as string]: `${(intensity / 20) * 100}%` }}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-base-800 bg-base-950/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-neutral-200">{activePattern ? activePattern.label : 'Vibration'}</span>
                <span className="font-mono text-neutral-400">{Math.round(previewValue)}/20</span>
              </div>
              <div className="relative h-28 overflow-hidden rounded-2xl border border-base-800 bg-base-950">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0,transparent_45%,rgba(255,45,135,0.08)_100%)]" />
                <div
                  className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-accent-600 via-accent-500 to-accent-300/80 transition-[height] duration-150"
                  style={{ height: `${previewPct}%` }}
                />
                <div className="absolute inset-x-5 top-1/2 h-px bg-white/10" />
                <div
                  className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 shadow-glow transition-transform duration-150"
                  style={{ transform: `translate(-50%, -50%) scale(${0.78 + previewPct / 110})` }}
                />
              </div>
              <div className="mt-4 grid h-12 grid-cols-6 items-end gap-1.5">
                {previewStrengths.slice(0, 6).map((strength, index) => (
                  <div
                    key={`${strength}-${index}`}
                    className={`rounded-t-lg border border-accent-400/20 transition-colors ${
                      activePattern && index === activeVisualStep
                        ? 'bg-accent-300'
                        : 'bg-accent-500/35'
                    }`}
                    style={{ height: `${Math.max(10, (strength / 20) * 100)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-5 rounded-[28px] border border-base-700 bg-base-900 p-5 shadow-2xl sm:p-6">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-200">
                <Waves size={17} className="text-accent-400" />
                Patterns
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LOVENSE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    disabled={isPending || !hasControl || effectivePaused}
                    className="btn-secondary min-h-11 justify-center px-3 py-2 text-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {CUSTOM_PATTERNS.map((pattern) => (
                  <button
                    key={pattern.label}
                    type="button"
                    onClick={() => handlePattern(pattern)}
                    disabled={isPending || !hasControl || effectivePaused}
                    className="btn-secondary min-h-11 justify-center px-3 py-2 text-xs"
                  >
                    {pattern.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto rounded-2xl border border-base-800 bg-base-950/70 p-4">
              <div className="grid grid-cols-2 gap-3">
                {!realtime.isControlling ? (
                  <button
                    onClick={handleStart}
                    disabled={isPending || !controlClientId || realtime.remainingCredit <= 0}
                    className="btn-accent col-span-2 min-h-12"
                  >
                    <Play size={18} />
                    Démarrer
                  </button>
                ) : hasControl ? (
                  <>
                    <button onClick={handlePauseResume} disabled={isPending} className="btn-secondary min-h-12">
                      {effectivePaused ? <PlayCircle size={18} /> : <Pause size={18} />}
                      {effectivePaused ? 'Reprendre' : 'Pause'}
                    </button>
                    <button onClick={handleStop} disabled={isPending} className="btn-secondary min-h-12 hover:border-red-500 hover:text-red-400">
                      <Square size={18} />
                      Arrêter
                    </button>
                  </>
                ) : (
                  <button disabled className="btn-secondary col-span-2 min-h-12 cursor-not-allowed opacity-70">
                    Liste d'attente
                  </button>
                )}
              </div>

              {realtime.isWaiting && (
                <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                  Vous êtes sur la liste d'attente. Vous pourrez démarrer dès que le contrôle en cours sera arrêté.
                </p>
              )}

              {realtime.remainingCredit <= 0 && (
                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-300">
                  Crédit épuisé pour cette semaine.
                </p>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatusPill({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 ${className}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-medium opacity-70">{label}</span>
        <span className="block truncate text-sm font-bold">{value}</span>
      </span>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-950/70 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-base-700 bg-base-850 text-accent-400">
        {icon}
      </div>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 truncate font-mono text-2xl font-bold text-neutral-50">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-900/80 p-4 shadow-lg">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-100">{value}</p>
    </div>
  );
}

function formatDisplayDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
