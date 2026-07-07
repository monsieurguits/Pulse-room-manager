import { NextResponse, type NextRequest } from 'next/server';
import { getToys } from '@/lib/lovense/service';

export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get('memberId');
  if (!memberId) {
    return NextResponse.json({ error: 'memberId requis.' }, { status: 400 });
  }

  const toys = await getToys(memberId);
  return NextResponse.json({ toys });
}
