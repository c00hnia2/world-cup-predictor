import { headers } from "next/headers";
import type { NextRequest } from "next/server";

function parseForwardedIp(forwarded: string | null): string | null {
  if (!forwarded) {
    return null;
  }

  const first = forwarded.split(",")[0]?.trim();
  return first && first.length > 0 ? first : null;
}

export function getClientIpFromRequest(request: NextRequest): string {
  return (
    parseForwardedIp(request.headers.get("x-forwarded-for")) ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function getClientIpFromHeaders(): Promise<string> {
  const headersList = await headers();

  return (
    parseForwardedIp(headersList.get("x-forwarded-for")) ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}
