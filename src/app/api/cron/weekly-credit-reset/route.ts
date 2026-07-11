import { NextResponse, type NextRequest } from 'next/server';
import { resetWeeklyCreditsIfDue } from '@/lib/session-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();

  if (secret) {
    const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
    const querySecret = request.nextUrl.searchParams.get('secret')?.trim();

    if (bearer !== secret && querySecret !== secret) {
      return NextResponse.json({ error: 'Cron non autorisé.' }, { status: 401 });
    }
  }

  const resetCount = await resetWeeklyCreditsIfDue();
  return NextResponse.json({ ok: true, resetCount });
}
