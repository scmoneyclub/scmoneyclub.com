"use client";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

export interface AnkrPriceResult {
  usdPrice: string;
  blockchain: string;
  contractAddress: string;
}

export interface AnkrRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

export type SupportedBlockchain = "eth" | "bsc" | "polygon" | "avax" | "fantom" | string;

export async function getAnkrTokenPrice(params: {
  blockchain: SupportedBlockchain;
  contractAddress: string;
  signal?: AbortSignal;
}): Promise<AnkrPriceResult | null> {
  const { blockchain, contractAddress, signal } = params;
  const key = process.env.NEXT_PUBLIC_ANKR_API_KEY || "";
  const endpoint = `https://rpc.ankr.com/multichain/${encodeURIComponent(key)}`;
  const body = {
    jsonrpc: "2.0",
    method: "ankr_getTokenPrice",
    params: { blockchain, contractAddress },
    id: 1,
  };
  const res = await axios.post<AnkrRpcResponse<AnkrPriceResult>>(endpoint, body, {
    headers: { "Content-Type": "application/json" },
    signal,
  });
  if (res.data.error) {
    throw new Error(res.data.error.message || "RPC Error");
  }
  return res.data.result ?? null;
}

export function useAnkrTokenPrice(options: {
  blockchain: SupportedBlockchain;
  contractAddress: string;
  autoRefreshMs?: number;
}) {
  const { blockchain, contractAddress, autoRefreshMs } = options;
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // initial load
  const [refreshing, setRefreshing] = useState(false); // stale-while-refresh flag
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const didLoadOnceRef = useRef(false);

  const load = useCallback(async () => {
    if (!blockchain || !contractAddress) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    // SWR behavior: if we already have data, mark as refreshing; otherwise it's the initial loading
    if (didLoadOnceRef.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await getAnkrTokenPrice({ blockchain, contractAddress, signal: controller.signal });
      setPrice(result?.usdPrice ?? null);
      didLoadOnceRef.current = true;
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
      // On error during refresh, keep stale data; only clear if we never had data
      setError(e?.message || "Failed to load Ankr price");
      if (!didLoadOnceRef.current) {
        setPrice(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [blockchain, contractAddress]);

  useEffect(() => {
    load();
    if (!autoRefreshMs || autoRefreshMs <= 0) return;
    const id = setInterval(load, autoRefreshMs);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [load, autoRefreshMs]);

  return { price, loading, refreshing, error, refresh: load };
}

// Backwards-compatible alias with a cleaner name for consumers that prefer generic naming
export const useTokenPrice = useAnkrTokenPrice;
