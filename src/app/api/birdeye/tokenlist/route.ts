import { NextRequest, NextResponse } from "next/server";

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const BIRDEYE_BASE = "https://public-api.birdeye.so";

const ALLOWED_CHAINS = new Set(["solana", "ethereum", "arbitrum", "bsc", "polygon"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const chain = searchParams.get("chain") || "solana";
  const sortBy = searchParams.get("sort_by") || "mc";
  const sortType = searchParams.get("sort_type") || "desc";
  const offset = searchParams.get("offset") || "0";
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 100); // cap at 100
  const minLiquidity = searchParams.get("min_liquidity") || "100";

  if (!ALLOWED_CHAINS.has(chain)) {
    return NextResponse.json({ error: "Invalid chain" }, { status: 400 });
  }

  try {
    const url = `${BIRDEYE_BASE}/defi/tokenlist?sort_by=${encodeURIComponent(sortBy)}&sort_type=${encodeURIComponent(sortType)}&offset=${encodeURIComponent(offset)}&limit=${limit}&min_liquidity=${encodeURIComponent(minLiquidity)}&ui_amount_mode=scaled`;

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "x-chain": chain,
        "x-api-key": BIRDEYE_API_KEY,
      },
      next: { revalidate: 60 }, // cache 60 s on the server
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
