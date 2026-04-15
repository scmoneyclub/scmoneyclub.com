"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface PriceResponse {
  success: boolean;
  message?: string;
  data?: {
    isScaledUiToken: boolean;
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
    priceChange24h?: number;
    priceInNative?: number;
  };
}

interface SolanaTokenPriceInfoProps {
  tokenContractAddress: string;
  title?: string;
}

// Proxy route — API key stays server-side
const buildProxyUrl = (address: string) =>
  `/api/birdeye/price?address=${encodeURIComponent(address)}&chain=solana`;

export default function SolanaTokenPriceInfo({
  tokenContractAddress,
  title = "Token Price",
}: SolanaTokenPriceInfoProps) {
  const [data, setData] = useState<PriceResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => buildProxyUrl(tokenContractAddress), [tokenContractAddress]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (!tokenContractAddress) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        const json: PriceResponse = await res.json();
        if (!json.success) {
          setError(json.message || "Request failed");
          return;
        }
        setData(json?.data ?? null);
      } catch (e: unknown) {
        const err = e as { name?: string; message?: string };
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load price");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [endpoint, tokenContractAddress]);

  const price = data?.value ?? null;
  const priceChange = data?.priceChange24h ?? null;
  const priceInNative = data?.priceInNative ?? null;
  const updatedAt = data?.updateHumanTime ?? (data?.updateUnixTime ? new Date(data.updateUnixTime * 1000).toISOString() : null);
  const changePositive = typeof priceChange === "number" && priceChange >= 0;

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4 text-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {loading && (
          <span className="inline-flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading
          </span>
        )}
      </div>

      {error && !loading && <p className="text-xs text-red-400 m-0">{error}</p>}

      {!error && (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {price !== null ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 8 })}` : "—"}
            </span>
            {typeof priceChange === "number" && (
              <span className={`inline-flex items-center gap-1 text-xs ${changePositive ? "text-emerald-400" : "text-red-400"}`}>
                {changePositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {priceChange.toFixed(2)}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
            <div>
              <p className="m-0">Price in SOL</p>
              <p className="m-0 text-white">{priceInNative !== null ? priceInNative.toLocaleString(undefined, { maximumFractionDigits: 10 }) : "—"}</p>
            </div>
            <div>
              <p className="m-0">Scaled UI Token</p>
              <p className="m-0 text-white">{data?.isScaledUiToken ? "Yes" : "No"}</p>
            </div>
            <div className="col-span-2">
              <p className="m-0">Updated</p>
              <p className="m-0 text-white">{updatedAt ? new Date(updatedAt).toLocaleString() : "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
