import { NextResponse, type NextRequest } from 'next/server';
import { getOverlayEvents } from '@/lib/overlay';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim();
  const afterRaw = request.nextUrl.searchParams.get('after');

  if (!token) {
    return NextResponse.json({ error: 'Token overlay manquant.' }, { status: 401 });
  }

  const after = afterRaw ? new Date(afterRaw) : new Date(Date.now() - 15_000);
  if (Number.isNaN(after.getTime())) {
    return NextResponse.json({ error: 'Date after invalide.' }, { status: 400 });
  }

  const events = await getOverlayEvents(token, after);
  if (!events) {
    return NextResponse.json({ error: 'Overlay introuvable.' }, { status: 404 });
  }

  return NextResponse.json({ events });
}
