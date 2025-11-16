
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
import PhantomWalletAssets from "@/components/phantom/Wallet";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WalletPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar />
        <ScrollArea className="max-h-[calc(100vh-56px)] overflow-y-auto">
          <PhantomWalletAssets />
        </ScrollArea>
      </main>
    </div>
  );
}
