import { NextResponse, type NextRequest } from 'next/server';
import { getToys } from '@/lib/lovense/service';
import { assertAdminCanAccessMember } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get('memberId');
  if (!memberId) {
    return NextResponse.json({ error: 'memberId requis.' }, { status: 400 });
  }

  try {
    await assertAdminCanAccessMember(memberId);
    const toys = await getToys(memberId);
    return NextResponse.json({ toys });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
