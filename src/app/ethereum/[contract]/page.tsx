
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import TokenAnkrPrice from "@/components/token/AnkrPrice";

export default async function SingleEthereumTokenPage({ params }: { params: Promise<{ 'contract': string }> }) {
  const { contract } = (await params);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar title="Token Details" />
        <ScrollArea className="max-h-[calc(100vh-40px)] overflow-y-auto">
          <TokenAnkrPrice blockchain="eth" contractAddress={contract} />
        </ScrollArea>
      </main>
    </div>
  );
}
