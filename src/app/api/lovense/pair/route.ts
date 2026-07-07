import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { generateQRCode } from '@/lib/lovense/service';

const bodySchema = z.object({ memberId: z.string().min(1) });

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'memberId requis.' }, { status: 400 });
  }

  try {
    const pairing = await generateQRCode(parsed.data.memberId);
    return NextResponse.json({ pairing: pairing.data, qrImageUrl: pairing.data?.qr });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
