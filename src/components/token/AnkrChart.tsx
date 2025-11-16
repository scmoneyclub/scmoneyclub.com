'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

interface TokenAnkrChartProps {
  blockchain: 'eth' | 'bsc' | 'polygon' | 'avax' | 'fantom' | string;
  contractAddress: string;
  /** Optional params for history; you can expand later */
  timeRange?: string; // e.g., '24h', '7d', '30d'
  interval?: string; // e.g., 'hour', 'day'
}

export default function TokenAnkrChart({
  blockchain,
  contractAddress,
  timeRange,
  interval,
}: TokenAnkrChartProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_ANKR_API_KEY || '';
    return `https://rpc.ankr.com/multichain/${encodeURIComponent(key)}`;
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!blockchain || !contractAddress) return;
      setLoading(true);
      setError(null);
      try {
        const body: any = {
          jsonrpc: '2.0',
          method: 'ankr_getTokenPriceHistory',
          params: {
            blockchain,
            contractAddress,
          },
          id: 1,
        };
        if (timeRange) body.params.timeRange = timeRange;
        if (interval) body.params.interval = interval;

        const res = await axios.post(endpoint, body, {
          headers: { 'Content-Type': 'application/json' },
        });

        // Log raw response for now; next step will parse and chart it
        console.log('Ankr price history response:', res.data);
      } catch (e: any) {
        const msg = e?.message || 'Failed to load Ankr price history';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [endpoint, blockchain, contractAddress, timeRange, interval]);

  return (
    <div className="p-4">
      <div className="rounded-md border border-gray-800 bg-gray-900/40 p-3 text-gray-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Ankr Price History</span>
          {loading && <span className="text-[10px] text-gray-500">Loading…</span>}
        </div>
        <div className="text-xs text-gray-400">
          <p className="m-0">Chain: <span className="text-white">{blockchain}</span></p>
          <p className="m-0">Contract: <span className="text-white break-all">{contractAddress}</span></p>
        </div>
        {error && <p className="text-xs text-red-400 m-0 mt-2">{error}</p>}
        {!error && !loading && (
          <p className="text-[12px] text-gray-500 m-0 mt-2">Open the console to view the fetched JSON.</p>
        )}
      </div>
    </div>
  );
}
