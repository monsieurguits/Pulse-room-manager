import { ObsOverlay } from '@/components/overlay/obs-overlay';

export const dynamic = 'force-dynamic';

export default async function ObsOverlayPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : '';

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
      <ObsOverlay token={token} />
    </>
  );
}
