'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Wrench } from 'lucide-react';
import type { MaintenanceNoticeInfo } from '@/lib/maintenance';

interface Props {
  notice: MaintenanceNoticeInfo;
  showPopup?: boolean;
  showBanner?: boolean;
}

export function MaintenanceNotice({ notice, showPopup = false, showBanner = true }: Props) {
  const storageKey = useMemo(() => `pulseroom-maintenance-dismissed:${notice.updatedAtKey}`, [notice.updatedAtKey]);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    if (!showPopup) return;
    setPopupOpen(window.localStorage.getItem(storageKey) !== '1');
  }, [showPopup, storageKey]);

  function closePopup() {
    window.localStorage.setItem(storageKey, '1');
    setPopupOpen(false);
  }

  const availabilityLabel = notice.siteUsable
    ? 'Le site reste utilisable pendant cette maintenance.'
    : 'Cette maintenance peut empêcher temporairement l’utilisation du site.';

  return (
    <>
      {showBanner ? (
        <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 shadow-lg shadow-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:text-center">
            <span className="inline-flex items-center justify-center gap-2 font-semibold text-amber-50">
              <Wrench size={16} />
              Maintenance prévue
            </span>
            <span>
              Du <strong>{notice.startLabel}</strong> au <strong>{notice.endLabel}</strong>. {availabilityLabel}
            </span>
          </div>
        </div>
      ) : null}

      {popupOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-3xl border border-white/15 bg-base-900 p-6 text-neutral-100 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                <Wrench size={24} />
              </div>
              <button
                type="button"
                onClick={closePopup}
                className="rounded-xl border border-base-700 bg-base-850 p-2 text-neutral-300 hover:text-white"
                aria-label="Fermer"
              >
                <X size={17} />
              </button>
            </div>
            <h2 className="mt-5 text-xl font-bold text-neutral-50">Maintenance prévue</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              Une maintenance PULSEROOM est prévue du <strong>{notice.startLabel}</strong> au{' '}
              <strong>{notice.endLabel}</strong>.
            </p>
            <p className="mt-3 rounded-2xl border border-base-800 bg-base-950/70 p-4 text-sm leading-6 text-neutral-300">
              {availabilityLabel}
            </p>
            <button type="button" onClick={closePopup} className="btn-accent mt-5 w-full justify-center">
              Compris
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
