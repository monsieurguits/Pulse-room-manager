import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { connect } from '@/lib/lovense/service';
import { assertAdminCanAccessMember } from '@/lib/auth';

const bodySchema = z.object({ memberId: z.string().min(1) });

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'memberId requis.' }, { status: 400 });
  }

  try {
    await assertAdminCanAccessMember(parsed.data.memberId);
    const connected = await connect(parsed.data.memberId);
    return NextResponse.json({ connected });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
