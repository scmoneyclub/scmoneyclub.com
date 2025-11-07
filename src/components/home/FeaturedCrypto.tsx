'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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

type Ticker = 'BTC' | 'ETH' | 'SOL';

interface CryptoPriceData {
  RAW: {
    [key: string]: {
      USD: {
        PRICE: number;
        CHANGEPCT24HOUR: number;
      };
    };
  };
  DISPLAY: {
    [key: string]: {
      USD: {
        PRICE: string;
        CHANGEPCT24HOUR: string;
      };
    };
  };
}

export default function HomeFeaturedCrypto() {
  const [selectedTicker, setSelectedTicker] = useState<Ticker>('BTC');
  const [chartData, setChartData] = useState<CryptoCompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState<CryptoPriceData | null>(null);

  const fetchChartData = async (ticker: Ticker) => {
    try {
      setLoading(true);
      const response = await axios.get<CryptoCompareData>(
        `https://min-api.cryptocompare.com/data/histoday?fsym=${ticker}&tsym=USD&limit=30&aggregate=1`
      );
      setChartData(response.data);
      // console.log(`${ticker} Chart Data:`, JSON.stringify(response.data));
    } catch (error) {
      console.error(`Error fetching ${ticker} chart data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceData = async () => {
    try {
      const response = await axios.get<CryptoPriceData>(
        'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,SOL&tsyms=USD'
      );
      setPriceData(response.data);
    } catch (error) {
      console.error('Error fetching price data:', error);
    }
  };

  useEffect(() => {
    fetchChartData(selectedTicker);
    fetchPriceData();
  }, [selectedTicker]);

  const processedChartData: ChartDataPoint[] = useMemo(() => {
    if (!chartData?.Data) return [];

    return chartData.Data.map((item) => {
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
  }, [chartData]);

  const currentPrice = processedChartData.length > 0 ? processedChartData[processedChartData.length - 1].price : 0;
  const previousPrice = processedChartData.length > 1 ? processedChartData[processedChartData.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100).toFixed(2) : '0.00';

  const getTickerData = (ticker: Ticker) => {
    if (!priceData) return null;
    return {
      price: priceData.RAW[ticker]?.USD?.PRICE || 0,
      changePercent: priceData.RAW[ticker]?.USD?.CHANGEPCT24HOUR || 0,
      displayPrice: priceData.DISPLAY[ticker]?.USD?.PRICE || '$0.00',
      displayChangePercent: priceData.DISPLAY[ticker]?.USD?.CHANGEPCT24HOUR || '0.00',
    };
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{data.date}</p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Close:</span> {formatPrice(data.close)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">High:</span> {formatPrice(data.high)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Low:</span> {formatPrice(data.low)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const tickerNames: Record<Ticker, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    SOL: 'Solana',
  };

  const tickerColors: Record<Ticker, string> = {
    BTC: '#f7931a',
    ETH: '#8c8c8c',
    SOL: '#a72add',
  };

  const currentTickerColor = tickerColors[selectedTicker];

  if (loading && !chartData) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading {tickerNames[selectedTicker]} data...</div>
      </div>
    );
  }

  if (!chartData || processedChartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <section className="bg-black py-8 lg:py-16">
      <div className="container mx-auto">
        <div className="w-full space-y-4">
          {/* Header with current price */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {tickerNames[selectedTicker]} ({selectedTicker})
              </h2>
              <p className="text-sm">30 Day Price History</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-white">
                {formatPrice(currentPrice)}
              </div>
              {/* <div
                className={`text-sm font-medium ${
                  priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {priceChange >= 0 ? '+' : ''}
                {formatPrice(priceChange)} ({priceChangePercent}%)
              </div> */}
            </div>
          </div>
          {/* Chart */}
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id={`colorPrice-${selectedTicker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentTickerColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={currentTickerColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
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
                  stroke={currentTickerColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#colorPrice-${selectedTicker})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center gap-4 mt-4">
          {(['BTC', 'ETH', 'SOL'] as Ticker[]).map((ticker) => {
            const tickerData = getTickerData(ticker);
            const isSelected = selectedTicker === ticker;
          
            return (
              <Button
                key={ticker}
                // variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedTicker(ticker)}
                className={`flex items-center bg-black-50 hover:bg-gray-800 text-white border p-8 gap-2 h-12 ${isSelected ? 'border-white' : 'border-gray-900'}`}
                size="lg"
              >
                <Image 
                  src={`/crypto/${ticker.toLowerCase()}.svg`} 
                  alt={ticker} 
                  width={24} 
                  height={24}
                  className="w-10 h-10"
                />
                {tickerData ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-start">
                      <span>{ticker}</span>
                      <span>{tickerData.displayPrice}</span>
                    </div>
                    <span
                      className={`flex items-center gap-1 ${
                        tickerData.changePercent >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {tickerData.changePercent >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>
                        {tickerData.changePercent >= 0 ? '+' : ''}
                        {tickerData.displayChangePercent}%
                      </span>
                    </span>
                  </div>
                ) : (
                  <span>Loading {ticker}...</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
