import { ObsCurveOverlay, ObsOverlay } from '@/components/overlay/obs-overlay';

export const dynamic = 'force-dynamic';

export default async function ObsOverlayPage({ searchParams }: { searchParams: Promise<{ token?: string; mode?: string }> }) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : '';
  const mode = typeof params.mode === 'string' ? params.mode : 'announce';

  return (
    <>
      <style>{`
        html,
        body {
          background: transparent !important;
          overflow: hidden;
        }

        .site-trust-footer {
          display: none !important;
        }
      `}</style>
      {mode === 'curve' ? <ObsCurveOverlay token={token} /> : <ObsOverlay token={token} />}
    </>
  );
}
