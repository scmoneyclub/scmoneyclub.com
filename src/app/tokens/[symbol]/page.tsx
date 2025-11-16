
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import TokenCryptoCompareDetails from "@/components/token/CryptoCompareDetails";

export default async function SingleTokenPage({ params }: { params: Promise<{ 'symbol': string }> }) {
  const { symbol } = (await params);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar title="Token Details" />
        <ScrollArea className="max-h-[calc(100vh-40px)] overflow-y-auto">
          <TokenCryptoCompareDetails symbol={symbol} />
        </ScrollArea>
      </main>
    </div>
  );
}
