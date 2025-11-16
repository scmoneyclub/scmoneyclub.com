"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
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

export default function DAOWallet({ ethereum_address }: { ethereum_address: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<AnkrAsset[]>([]);
  const [totalUsd, setTotalUsd] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_ANKR_API_KEY || "";
    return `https://rpc.ankr.com/multichain/${encodeURIComponent(key)}`;
  }, []);

  const fetchWalletBalance = async () => {
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
      const res = await axios.post<AnkrAccountBalanceResponse>(endpoint, body, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.error) {
        throw new Error(res.data.error.message || "RPC Error");
      }
      const result = res.data.result;
      setAssets(result?.assets ?? []);
      setTotalUsd(result?.totalBalanceUsd ?? null);
    } catch (e: any) {
      setError(e?.message || "Failed to load wallet data");
      setAssets([]);
      setTotalUsd(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereum_address]);

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
                        <Link href="https://etherscan.io/" target="_blank">{a.tokenName}</Link>
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