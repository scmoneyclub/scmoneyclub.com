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

  // Solana addresses: 32–44 base58 chars
  // Ethereum addresses: 0x + 40 hex chars
  const isSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  const isEvm = /^0x[0-9a-fA-F]{40}$/.test(address);
  if (!isSolana && !isEvm) {
    return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
  }

  try {
    const url = `${BIRDEYE_BASE}/defi/price?address=${encodeURIComponent(address)}&ui_amount_mode=raw`;

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "x-chain": chain,
        "x-api-key": BIRDEYE_API_KEY,
      },
      next: { revalidate: 15 }, // cache 15 s
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
