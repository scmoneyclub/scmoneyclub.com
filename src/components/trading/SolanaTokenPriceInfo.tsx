"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface PriceResponse {
  success: boolean;
  message?: string;
  data?: {
    isScaledUiToken: boolean;
    value: number; // price in USD (assumed)
    updateUnixTime: number;
    updateHumanTime: string; // ISO
    priceChange24h?: number; // percent
    priceInNative?: number; // priced in SOL
  };
}

interface SolanaTokenPriceInfoProps {
  tokenContractAddress: string;
  title?: string;
  apiUrl?: string; // override full URL
}

const DEFAULT_ENDPOINT = (address: string) =>
  `https://public-api.birdeye.so/defi/price?address=${address}&ui_amount_mode=raw`;

export default function SolanaTokenPriceInfo({
  tokenContractAddress,
  title = "Token Price",
  apiUrl,
}: SolanaTokenPriceInfoProps) {
  const [data, setData] = useState<PriceResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => apiUrl ?? DEFAULT_ENDPOINT(tokenContractAddress), [apiUrl, tokenContractAddress]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!tokenContractAddress) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<PriceResponse>(endpoint, {
          headers: {
            accept: "application/json",
            "x-chain": "solana",
            "x-api-key": process.env.NEXT_PUBLIC_BIRDEYE_API_KEY,
          },
        });
        if (!res.data.success) {
          if (isMounted) setError(res.data.message || "Request failed");
          return;
        }
        if (isMounted) setData(res.data?.data ?? null);
      } catch (e: any) {
        if (!isMounted) return;
        if (axios.isAxiosError(e)) {
          const msg = (e.response?.data as PriceResponse | undefined)?.message;
          setError(msg || "Failed to load price");
        } else {
          setError("Failed to load price");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
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

      {error && !loading && (
        <p className="text-xs text-red-400 m-0">{error}</p>
      )}

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
