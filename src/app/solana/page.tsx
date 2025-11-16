
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SolanaTokenList from "@/components/trading/SolanaTokenList";

export default function SolanaPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar title="Solana" chain="solana" />
        <ScrollArea className="max-h-[calc(100vh-40px)] overflow-y-auto">
          <SolanaTokenList />
        </ScrollArea>
      </main>
    </div>
  );
}