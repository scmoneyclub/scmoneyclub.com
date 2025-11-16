"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface TokenItem {
  address: string;
  symbol: string;
  name: string;
  decimals?: number;
  price?: number;
  liquidity?: number;
  logoURI?: string | null;
  v24hUSD?: number | null;
  v24hChangePercent?: number | null;
  mc?: number | null; // market cap
  lastTradeUnixTime?: number | null;
}

interface BirdeyeResponse {
  data?: {
    total?: number;
    items?: Array<{
      address: string;
      symbol: string;
      name: string;
      decimals?: number;
      price?: number;
      liquidity?: number;
      logoURI?: string | null;
      v24hUSD?: number | null;
      v24hChangePercent?: number | null;
      mc?: number | null;
      lastTradeUnixTime?: number | null;
    }>;
    tokens?: Array<{
      address: string;
      symbol: string;
      name: string;
      decimals?: number;
      price?: number;
      liquidity?: number;
      logoURI?: string | null;
      v24hUSD?: number | null;
      v24hChangePercent?: number | null;
      mc?: number | null;
      lastTradeUnixTime?: number | null;
    }>;
  };
}

interface TradingEthereumTokenListProps {
  apiUrl?: string;
  limit?: number;
}

const DEFAULT_API =
  "https://public-api.birdeye.so/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=50&min_liquidity=100&ui_amount_mode=scaled";

type SortKey = "mc" | "v24hUSD" | "v24hChangePercent" | "liquidity";

export default function EthereumTokenList({ apiUrl = DEFAULT_API, limit = 100 }: TradingEthereumTokenListProps) {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("mc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) =>
      [t.symbol, t.name, t.address].some((v) => v?.toLowerCase().includes(q))
    );
  }, [query, tokens]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = (a[sortKey] as number | null | undefined) ?? -Infinity;
      const bv = (b[sortKey] as number | null | undefined) ?? -Infinity;
      // Descending
      return (bv as number) - (av as number);
    });
    return list;
  }, [filtered, sortKey]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<BirdeyeResponse>(apiUrl, {
          headers: {
            accept: "application/json",
            "x-chain": "ethereum",
            "x-api-key": process.env.NEXT_PUBLIC_BIRDEYE_API_KEY,
          },
          params: {
            limit,
          },
        });
        const items = res.data?.data?.items ?? res.data?.data?.tokens ?? [];
        if (isMounted) {
          setTokens(
            items.map((i) => ({
              address: i.address,
              symbol: i.symbol,
              name: i.name,
              decimals: i.decimals,
              price: i.price,
              liquidity: i.liquidity,
              logoURI: i.logoURI ?? null,
              v24hUSD: i.v24hUSD ?? null,
              v24hChangePercent: i.v24hChangePercent ?? null,
              mc: i.mc ?? null,
              lastTradeUnixTime: i.lastTradeUnixTime ?? null,
            }))
          );
        }
      } catch (e) {
        if (isMounted) setError("Failed to load tokens");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [apiUrl, limit]);

  const formatUsd = (n?: number | null, digits = 2) =>
    typeof n === "number" ? `$${n.toLocaleString(undefined, { maximumFractionDigits: digits })}` : "—";

  const formatPercent = (n?: number | null) =>
    typeof n === "number" ? `${n.toFixed(2)}%` : "—";

  const formatTime = (unix?: number | null) =>
    typeof unix === "number" && unix > 0 ? new Date(unix * 1000).toLocaleString() : "—";

  return (
    <section>
      <div className="p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-white">Ethereum Tokens</h2>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by symbol, name, or address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              value={sortKey}
              onValueChange={(value) => setSortKey(value as SortKey)}
            >
              <SelectTrigger className="h-9 rounded-md border border-gray-800 bg-black px-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mc">Market Cap</SelectItem>
                <SelectItem value="v24hUSD">24h Volume</SelectItem>
                <SelectItem value="v24hChangePercent">24h Change Percent</SelectItem>
                <SelectItem value="liquidity">Liquidity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading tokens…</span>
          </div>
        )}
        {error && !loading && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-md border border-gray-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/60 text-gray-400">
                <tr>
                  <th className="px-3 py-2">Token</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">24h %</th>
                  <th className="px-3 py-2">24h Vol (USD)</th>
                  <th className="px-3 py-2">Liquidity</th>
                  <th className="px-3 py-2">Market Cap</th>
                  <th className="px-3 py-2">Last Trade</th>
                  <th className="px-3 py-2">Address</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => {
                  const up = typeof t.v24hChangePercent === "number" && t.v24hChangePercent >= 0;
                  return (
                    <tr key={t.address} className="border-t border-gray-800 text-gray-300">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {t.logoURI ? (
                            <img src={t.logoURI} alt={t.symbol} className="h-6 w-6 rounded-full" />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-800" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{t.symbol}</span>
                            <span className="text-xs text-gray-400">{t.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">{formatUsd(t.price, 6)}</td>
                      <td className={`px-3 py-2 ${up ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(t.v24hChangePercent)}</td>
                      <td className="px-3 py-2">{formatUsd(t.v24hUSD, 0)}</td>
                      <td className="px-3 py-2">{typeof t.liquidity === "number" ? t.liquidity.toLocaleString() : "—"}</td>
                      <td className="px-3 py-2">{formatUsd(t.mc, 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatTime(t.lastTradeUnixTime)}</td>
                      <td className="px-3 py-2 font-mono text-xs break-all">{t.address}</td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-400" colSpan={8}>
                      No tokens found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}