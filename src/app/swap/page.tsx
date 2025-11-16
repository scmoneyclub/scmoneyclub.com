
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
import JupiterSwapContainer from "@/components/jupiter/SwapContainer";

export default function SwapPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar />
        <JupiterSwapContainer />
      </main>
    </div>
  );
}