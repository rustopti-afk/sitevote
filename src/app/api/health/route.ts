import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 * Returns a simple status object so uptime monitors can verify the API is alive.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
