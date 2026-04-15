'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface CryptoCompareData {
  Response: string;
  Type: number;
  Aggregated: boolean;
  TimeTo: number;
  TimeFrom: number;
  FirstValueInArray: boolean;
  ConversionType: {
    type: string;
    conversionSymbol: string;
  };
  Data: Array<{
    time: number;
    high: number;
    low: number;
    open: number;
    volumefrom: number;
    volumeto: number;
    close: number;
    conversionType: string;
    conversionSymbol: string;
  }>;
  RateLimit: Record<string, unknown>;
  HasWarning: boolean;
}

interface ChartDataPoint {
  date: string;
  dateShort: string;
  price: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

interface TokenCryptoCompareDetailsProps {
  symbol: string; // e.g. 'SOL', 'ETH'
  displayName?: string; // Optional pretty name; defaults to symbol
  days?: number; // default 30
}

export default function TokenCryptoCompareDetails({ symbol = 'BTC', displayName, days = 30 }: TokenCryptoCompareDetailsProps) {
  const [data, setData] = useState<CryptoCompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const name = displayName || symbol.toUpperCase();

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<CryptoCompareData>(
        `https://min-api.cryptocompare.com/data/histoday?fsym=${encodeURIComponent(symbol.toUpperCase())}&tsym=USD&limit=${Math.max(
          1,
          days
        )}&aggregate=1`
      );
      setData(response.data);
    } catch (_error) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, days]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data?.Data) return [];
    return data.Data.map((item) => {
      const date = new Date(item.time * 1000);
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        dateShort: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: item.close,
        high: item.high,
        low: item.low,
        open: item.open,
        close: item.close,
      };
    });
  }, [data]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100).toFixed(2) : '0.00';

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    const point = payload?.[0]?.payload;
    if (active && point) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{point.date}</p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Close:</span> {formatPrice(point.close)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">High:</span> {formatPrice(point.high)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Low:</span> {formatPrice(point.low)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading {name} data...</div>
      </div>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-gray-500">No data available for {name}</div>
      </div>
    );
  }

  return (
    <section>
      <div className="p-4">
        <div className="w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{name} ({symbol.toUpperCase()})</h2>
              <p className="text-sm">{days} Day Price History</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold">
                {formatPrice(currentPrice)}
              </div>
              <div
                className={`text-sm font-medium ${
                  priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {priceChange >= 0 ? '+' : ''}
                {formatPrice(priceChange)} ({priceChangePercent}%)
              </div>
            </div>
          </div>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorTokenPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTokenPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
