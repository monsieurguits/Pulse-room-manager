import { NextResponse, type NextRequest } from "next/server";
import { handleCallback } from "@/lib/lovense/service";
import type { LovenseCallbackPayload } from "@/types";

export async function GET(request: NextRequest) {
  console.log("========== LOVENSE CALLBACK GET ==========");
  console.log(request.nextUrl.toString());
  console.log("==========================================");

  const payload = payloadFromSearchParams(request.nextUrl.searchParams);

  if (payload.uid) {
    await handleCallback(payload);
  }

  return NextResponse.json({
    ok: true,
    message: "Lovense callback endpoint OK. Utilisez cette URL dans Lovense : https://pulse-room.app/api/lovense/callback",
  });
}

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

function payloadFromSearchParams(params: URLSearchParams): LovenseCallbackPayload {
  const toysRaw = params.get("toys");
  let toys: LovenseCallbackPayload["toys"] | undefined;

  if (toysRaw) {
    try {
      toys = JSON.parse(toysRaw) as LovenseCallbackPayload["toys"];
    } catch {
      toys = undefined;
    }
  }

  return {
    uid: params.get("uid") || "",
    domain: params.get("domain") || undefined,
    httpsPort: params.get("httpsPort") || params.get("https_port") || undefined,
    wsPort: params.get("wsPort") || params.get("ws_port") || undefined,
    wssPort: params.get("wssPort") || params.get("wss_port") || undefined,
    toys,
  };
}
