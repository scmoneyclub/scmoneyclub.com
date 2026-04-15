"use client";

import { useCallback, useEffect, useState } from "react";
import { formatUsd } from "@/utils/formats";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface AnkrAsset {
  balance: string;
  balanceRawInteger: string;
  balanceUsd: string;
  blockchain: string;
  contractAddress: string;
  holderAddress: string;
  thumbnail?: string;
  tokenDecimals: number;
  tokenName: string;
  tokenPrice: string;
  tokenSymbol: string;
  tokenType: string;
}

interface AnkrAccountBalanceResponse {
  jsonrpc: string;
  id: number;
  error?: { code?: number; message?: string };
  result?: {
    assets: AnkrAsset[];
    nextPageToken?: string;
    totalBalanceUsd?: string;
  };
}

// Proxy route keeps the Ankr API key server-side
const ANKR_PROXY = "/api/ankr";

export default function DAOWallet({ ethereum_address }: { ethereum_address: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<AnkrAsset[]>([]);
  const [totalUsd, setTotalUsd] = useState<string | null>(null);

  const fetchWalletBalance = useCallback(async () => {
    if (!ethereum_address) return;
    setLoading(true);
    setError(null);
    try {
      const body = {
        jsonrpc: "2.0",
        method: "ankr_getAccountBalance",
        params: {
          blockchain: "eth",
          walletAddress: ethereum_address,
        },
        id: 1,
      };
      const res = await fetch(ANKR_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: AnkrAccountBalanceResponse = await res.json();
      if (data.error) {
        throw new Error(data.error.message || "RPC Error");
      }
      setAssets(data.result?.assets ?? []);
      setTotalUsd(data.result?.totalBalanceUsd ?? null);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || "Failed to load wallet data");
      setAssets([]);
      setTotalUsd(null);
    } finally {
      setLoading(false);
    }
  }, [ethereum_address]);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  if (loading) {
    return (
      <Card className="bg-black border-gray-800">
        <CardContent>
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-gray-800">
      <CardContent>
        {error && <p className="text-xs text-red-400 m-0">{error}</p>}
        {!error && (
          <div className="space-y-3">
            <div className="text-sm">
              <p className="m-0 text-gray-400">Total Balance (USD)</p>
              <p className="m-0 text-white text-xl">{totalUsd ? formatUsd(Number(totalUsd), 2) : "—"}</p>
            </div>
            <div className="overflow-x-auto rounded border border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-900/60 text-gray-400">
                  <tr>
                    <th className="px-3 py-2">Asset</th>
                    <th className="px-3 py-2">Symbol</th>
                    <th className="px-3 py-2">Balance</th>
                    <th className="px-3 py-2">USD</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={`${a.contractAddress}-${a.tokenSymbol}`} className="border-t border-gray-800 text-gray-300">
                      <td className="px-3 py-2">
                        <Link href="https://etherscan.io/" target="_blank" rel="noopener noreferrer">
                          {a.tokenName}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/tokens/${a.tokenSymbol}`}>{a.tokenSymbol}</Link>
                      </td>
                      <td className="px-3 py-2">{a.balance}</td>
                      <td className="px-3 py-2">
                        {a.balanceUsd ? formatUsd(Number(a.balanceUsd), 2) : "—"}
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 && (
                    <tr>
                      <td className="px-3 py-4 text-gray-400" colSpan={4}>No assets found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
