"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent, formatTime, formatUsd } from "@/utils/formats";

type Chain = "solana" | "ethereum";
type SortKey = "mc" | "v24hUSD" | "v24hChangePercent" | "liquidity";

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
    items?: Array<TokenItem>;
    tokens?: Array<TokenItem>;
  };
}

interface TokenListProps {
  chain: Chain;
  limit?: number;
}

const CHAIN_CONFIG: Record<
  Chain,
  {
    heading: string;
    hrefBase: string;
    query: string;
  }
> = {
  solana: {
    heading: "Solana Tokens",
    hrefBase: "/solana",
    query: "/api/birdeye/tokenlist?chain=solana&sort_by=mc&sort_type=desc&offset=0&min_liquidity=100",
  },
  ethereum: {
    heading: "Ethereum Tokens",
    hrefBase: "/ethereum",
    query: "/api/birdeye/tokenlist?chain=ethereum&sort_by=v24hUSD&sort_type=desc&offset=0&min_liquidity=100",
  },
};

function normalizeTokens(response: BirdeyeResponse): TokenItem[] {
  const items = response.data?.items ?? response.data?.tokens ?? [];

  return items.map((item) => ({
    address: item.address,
    symbol: item.symbol,
    name: item.name,
    decimals: item.decimals,
    price: item.price,
    liquidity: item.liquidity,
    logoURI: item.logoURI ?? null,
    v24hUSD: item.v24hUSD ?? null,
    v24hChangePercent: item.v24hChangePercent ?? null,
    mc: item.mc ?? null,
    lastTradeUnixTime: item.lastTradeUnixTime ?? null,
  }));
}

async function fetchTokens(chain: Chain, limit: number): Promise<TokenItem[]> {
  const response = await fetch(`${CHAIN_CONFIG[chain].query}&limit=${limit}`);
  const data: BirdeyeResponse = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Failed to load tokens");
  }

  return normalizeTokens(data);
}

export function TokenListSkeleton() {
  return (
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
          {Array.from({ length: 8 }).map((_, index) => (
            <tr key={index} className="border-t border-gray-800 text-gray-300">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-18" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-14" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TokenList({ chain, limit = 50 }: TokenListProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("mc");
  const config = CHAIN_CONFIG[chain];

  const { data: tokens = [], isLoading, error, isRefetching, refetch } = useQuery({
    queryKey: ["tokens", chain, limit],
    queryFn: () => fetchTokens(chain, limit),
  });

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return tokens;
    }

    return tokens.filter((token) =>
      [token.symbol, token.name, token.address].some((value) =>
        value?.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query, tokens]);

  const sorted = useMemo(() => {
    const list = [...filtered];

    list.sort((a, b) => {
      const aValue = (a[sortKey] as number | null | undefined) ?? -Infinity;
      const bValue = (b[sortKey] as number | null | undefined) ?? -Infinity;
      return bValue - aValue;
    });

    return list;
  }, [filtered, sortKey]);

  return (
    <section>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">{config.heading}</h2>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by symbol, name, or address"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
        {isLoading && <TokenListSkeleton />}
        {error && !isLoading && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-red-500/20 bg-red-500/5 py-12 text-center">
            <p className="text-sm text-red-400">{error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="border-gray-700 bg-black text-gray-200 hover:bg-gray-900 hover:text-white"
            >
              {isRefetching ? "Retrying..." : "Try again"}
            </Button>
          </div>
        )}
        {!isLoading && !error && (
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
                {sorted.map((token) => {
                  const isPositive =
                    typeof token.v24hChangePercent === "number" && token.v24hChangePercent >= 0;

                  return (
                    <tr key={token.address} className="border-t border-gray-800 text-gray-300">
                      <td className="px-3 py-2">
                        <Link
                          href={`${config.hrefBase}/${token.address}`}
                          className="group flex items-center gap-2 hover:text-white"
                        >
                          {token.logoURI ? (
                            <Image
                              src={token.logoURI}
                              alt={token.symbol}
                              width={24}
                              height={24}
                              className="rounded-full"
                              unoptimized
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-800" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-white group-hover:underline">
                              {token.symbol}
                            </span>
                            <span className="text-xs text-gray-400">{token.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-2">{formatUsd(token.price, 6)}</td>
                      <td className={`px-3 py-2 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {formatPercent(token.v24hChangePercent)}
                      </td>
                      <td className="px-3 py-2">{formatUsd(token.v24hUSD, 0)}</td>
                      <td className="px-3 py-2">
                        {typeof token.liquidity === "number" ? token.liquidity.toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2">{formatUsd(token.mc, 0)}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {formatTime(token.lastTradeUnixTime)}
                      </td>
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
