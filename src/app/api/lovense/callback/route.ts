import { NextResponse, type NextRequest } from "next/server";
import { handleCallback } from "@/lib/lovense/service";
import type { LovenseCallbackPayload } from "@/types";

export async function POST(request: NextRequest) {
  console.log("🔥 CALLBACK REÇU");
  const payload = (await request.json().catch(() => null)) as LovenseCallbackPayload | null;
  console.log(payload);

  console.log("========== LOVENSE CALLBACK ==========");
  console.dir(payload, { depth: null });
  console.log("======================================");

  if (!payload?.uid) {
    return NextResponse.json(
      { error: "Payload invalide." },
      { status: 400 }
    );
  }

  await handleCallback(payload);

  return NextResponse.json({ ok: true });
}