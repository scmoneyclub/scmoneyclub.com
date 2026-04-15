"use client";
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

// All Ankr calls are routed through /api/ankr to keep the API key server-side.
const ANKR_PROXY = "/api/ankr";

export async function getAnkrTokenPrice(params: {
  blockchain: SupportedBlockchain;
  contractAddress: string;
  signal?: AbortSignal;
}): Promise<AnkrPriceResult | null> {
  const { blockchain, contractAddress, signal } = params;
  const body = {
    jsonrpc: "2.0",
    method: "ankr_getTokenPrice",
    params: { blockchain, contractAddress },
    id: 1,
  };
  const res = await fetch(ANKR_PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data: AnkrRpcResponse<AnkrPriceResult> = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "RPC Error");
  }
  return data.result ?? null;
}

export function useAnkrTokenPrice(options: {
  blockchain: SupportedBlockchain;
  contractAddress: string;
  autoRefreshMs?: number;
}) {
  const { blockchain, contractAddress, autoRefreshMs } = options;
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const didLoadOnceRef = useRef(false);

  const load = useCallback(async () => {
    if (!blockchain || !contractAddress) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
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
    } catch (e: unknown) {
      const err = e as { name?: string; code?: string; message?: string };
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      setError(err?.message || "Failed to load Ankr price");
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

// Backwards-compatible alias
export const useTokenPrice = useAnkrTokenPrice;
