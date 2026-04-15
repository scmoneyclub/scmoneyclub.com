"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatUsd, formatTime } from "@/utils/formats";
import Link from "next/link";
import Image from "next/image";

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
  mc?: number | null;
  lastTradeUnixTime?: number | null;
}

interface BirdeyeResponse {
  success?: boolean;
  message?: string;
  data?: {
    total?: number;
    items?: Array<TokenItem>;
    tokens?: Array<TokenItem>;
  };
}

interface TradingEthereumTokenListProps {
  limit?: number;
}

// Proxy route — API key stays server-side
const PROXY_URL = "/api/birdeye/tokenlist?chain=ethereum&sort_by=v24hUSD&sort_type=desc&offset=0&min_liquidity=100";

type SortKey = "mc" | "v24hUSD" | "v24hChangePercent" | "liquidity";

export default function EthereumTokenList({ limit = 50 }: TradingEthereumTokenListProps) {
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
      return (bv as number) - (av as number);
    });
    return list;
  }, [filtered, sortKey]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${PROXY_URL}&limit=${limit}`, { signal: controller.signal });
        const data: BirdeyeResponse = await res.json();
        if (data.success === false) {
          setError(data.message || "Request failed");
          return;
        }
        const items = data?.data?.items ?? data?.data?.tokens ?? [];
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
      } catch (e: unknown) {
        const err = e as { name?: string; message?: string };
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load tokens");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [limit]);

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
            <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
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
        {error && !loading && <p className="text-red-400 text-sm">{error}</p>}
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
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => {
                  const up = typeof t.v24hChangePercent === "number" && t.v24hChangePercent >= 0;
                  return (
                    <tr key={t.address} className="border-t border-gray-800 text-gray-300">
                      <td className="px-3 py-2">
                        <Link href={`/ethereum/${t.address}`} className="flex items-center gap-2">
                          {t.logoURI ? (
                            <Image
                              src={t.logoURI}
                              alt={t.symbol}
                              width={24}
                              height={24}
                              className="rounded-full"
                              unoptimized
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-800" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{t.symbol}</span>
                            <span className="text-xs text-gray-400">{t.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-2">{formatUsd(t.price, 6)}</td>
                      <td className={`px-3 py-2 ${up ? "text-emerald-400" : "text-red-400"}`}>
                        {typeof t.v24hChangePercent === "number" ? `${t.v24hChangePercent.toFixed(2)}%` : "—"}
                      </td>
                      <td className="px-3 py-2">{formatUsd(t.v24hUSD, 0)}</td>
                      <td className="px-3 py-2">{typeof t.liquidity === "number" ? t.liquidity.toLocaleString() : "—"}</td>
                      <td className="px-3 py-2">{formatUsd(t.mc, 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatTime(t.lastTradeUnixTime)}</td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-400" colSpan={7}>
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
