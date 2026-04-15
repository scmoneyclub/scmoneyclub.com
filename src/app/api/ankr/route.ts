import { NextRequest, NextResponse } from "next/server";

const ANKR_API_KEY = process.env.ANKR_API_KEY || "";
const ANKR_ENDPOINT = `https://rpc.ankr.com/multichain/${encodeURIComponent(ANKR_API_KEY)}`;

const ALLOWED_METHODS = new Set([
  "ankr_getTokenPrice",
  "ankr_getTokenPriceHistory",
  "ankr_getAccountBalance",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Whitelist only safe read-only RPC methods
    if (!body?.method || !ALLOWED_METHODS.has(body.method)) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 400 }
      );
    }

    const response = await fetch(ANKR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
