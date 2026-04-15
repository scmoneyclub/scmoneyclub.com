"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface TokenOverviewResponse {
  success: boolean;
  message?: string;
  data?: {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
    marketCap?: number;
    fdv?: number;
    logoURI?: string | null;
    liquidity?: number;
    lastTradeUnixTime?: number;
    lastTradeHumanTime?: string;
    price?: number;
    v24hUSD?: number;
    v24hChangePercent?: number;
    isScaledUiToken?: boolean;
  };
}

export default function TokenDetails({ contract }: { contract: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<TokenOverviewResponse["data"] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const getTokenDetails = async () => {
      if (!contract) return;
      setLoading(true);
      setError(null);
      try {
        // Routed through /api/birdeye/token-overview — API key stays server-side
        const res = await fetch(
          `/api/birdeye/token-overview?address=${encodeURIComponent(contract)}&chain=solana`,
          { signal: controller.signal }
        );
        const data: TokenOverviewResponse = await res.json();
        if (!data.success) {
          setError(data.message || "Failed to load token overview");
          return;
        }
        setOverview(data.data ?? null);
      } catch (e: unknown) {
        const err = e as { name?: string; message?: string };
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load token overview");
      } finally {
        setLoading(false);
      }
    };
    getTokenDetails();
    return () => controller.abort();
  }, [contract]);

  const formatUsd = (n?: number) => (typeof n === "number" ? `$${n.toLocaleString()}` : "—");
  const formatPct = (n?: number) => (typeof n === "number" ? `${n.toFixed(2)}%` : "—");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-white m-0">Token Details {contract}</h1>
      {loading && <p className="text-gray-400 m-0">Loading token overview…</p>}
      {error && !loading && <p className="text-red-400 m-0">{error}</p>}
      {!loading && !error && overview && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {overview.logoURI ? (
              <Image
                src={overview.logoURI}
                alt={overview.symbol ?? "Token"}
                width={40}
                height={40}
                className="rounded"
                unoptimized
              />
            ) : (
              <div className="h-10 w-10 rounded bg-gray-800" />
            )}
            <div>
              <h2 className="text-2xl font-semibold text-white m-0">
                {overview.name} <span className="text-gray-400 text-lg">({overview.symbol})</span>
              </h2>
              <p className="text-xs text-gray-500 m-0">{contract}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 m-0">Price</p>
              <p className="text-white m-0">{formatUsd(overview.price)}</p>
            </div>
            <div>
              <p className="text-gray-400 m-0">24h Volume</p>
              <p className="text-white m-0">{formatUsd(overview.v24hUSD)}</p>
            </div>
            <div>
              <p className="text-gray-400 m-0">24h Change</p>
              <p className={`m-0 ${overview.v24hChangePercent && overview.v24hChangePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatPct(overview.v24hChangePercent)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 m-0">Market Cap</p>
              <p className="text-white m-0">{formatUsd(overview.marketCap)}</p>
            </div>
            <div>
              <p className="text-gray-400 m-0">FDV</p>
              <p className="text-white m-0">{formatUsd(overview.fdv)}</p>
            </div>
            <div>
              <p className="text-gray-400 m-0">Liquidity</p>
              <p className="text-white m-0">{formatUsd(overview.liquidity)}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Updated: {overview.lastTradeHumanTime || (overview.lastTradeUnixTime ? new Date(overview.lastTradeUnixTime * 1000).toLocaleString() : "—")}
          </div>
        </div>
      )}
    </div>
  );
}
