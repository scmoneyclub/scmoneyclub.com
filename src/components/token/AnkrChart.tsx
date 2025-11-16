'use client';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export interface AnkrPriceHistoryQuote {
  timestamp: number;
  blockHeight: number;
  usdPrice: string;
}

interface TokenAnkrChartProps {
  blockchain: 'eth' | 'bsc' | 'polygon' | 'avax' | 'fantom' | string;
  contractAddress: string;
  timeRange?: string;
  interval?: string;
  /** If provided, chart will use these quotes and skip fetching */
  quotes?: AnkrPriceHistoryQuote[];
}

interface AnkrPriceHistoryResponse {
  jsonrpc: string;
  id: number;
  result?: {
    quotes: AnkrPriceHistoryQuote[];
    syncStatus?: { timestamp: number; lag: string; status: string };
  };
  error?: { code: number; message: string };
}

export default function TokenAnkrChart({
  blockchain,
  contractAddress,
  timeRange,
  interval,
  quotes: externalQuotes,
}: TokenAnkrChartProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<AnkrPriceHistoryQuote[]>([]);

  const endpoint = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_ANKR_API_KEY || '';
    return `https://rpc.ankr.com/multichain/${encodeURIComponent(key)}`;
  }, []);

  useEffect(() => {
    if (externalQuotes && externalQuotes.length) {
      setQuotes(externalQuotes);
      setError(null);
      setLoading(false);
      return;
    }
    const fetchHistory = async () => {
      if (!blockchain || !contractAddress) return;
      setLoading(true);
      setError(null);
      try {
        const body: any = {
          jsonrpc: '2.0',
          method: 'ankr_getTokenPriceHistory',
          params: { blockchain, contractAddress },
          id: 1,
        };
        if (timeRange) body.params.timeRange = timeRange;
        if (interval) body.params.interval = interval;
        const res = await axios.post<AnkrPriceHistoryResponse>(endpoint, body, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.data.error) throw new Error(res.data.error.message || 'RPC Error');
        setQuotes(res.data.result?.quotes ?? []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load Ankr price history');
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [endpoint, blockchain, contractAddress, timeRange, interval, externalQuotes]);

  const chartData = useMemo(() => {
    return (externalQuotes?.length ? externalQuotes : quotes).map((q) => {
      const dateObj = new Date(q.timestamp * 1000);
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateShort: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Number(q.usdPrice),
      };
    });
  }, [quotes, externalQuotes]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{d.date}</p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Close:</span> {formatPrice(d.price)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section>
      <div className="p-4">
        <div className="w-full space-y-4">
          {loading && (
            <div className=" w-full h-[400px] flex items-center justify-center ">
              <div className="text-gray-500">Loading price history…</div>
            </div>
          )}
          {error && !loading && (
            <div className="w-full h-[400px] flex items-center jutify-center">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}
          {!loading && !error && chartData.length > 0 && (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorAnkrPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="dateShort"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAnkrPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
