import { NextRequest, NextResponse } from "next/server";

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const BIRDEYE_BASE = "https://public-api.birdeye.so";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chain = searchParams.get("chain") || "solana";

  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
  }

  // Basic address validation — Solana addresses are 32–44 base58 chars
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
  }

  try {
    const url = `${BIRDEYE_BASE}/defi/token_overview?address=${encodeURIComponent(address)}&ui_amount_mode=scaled`;
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "x-chain": chain,
        "x-api-key": BIRDEYE_API_KEY,
      },
      next: { revalidate: 30 }, // cache 30 s on the server
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
