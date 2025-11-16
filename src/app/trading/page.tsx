
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
import ListingContainer from "@/components/trading/ListingContainer";

export default function TradingPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar />
        <ListingContainer />
      </main>
    </div>
  );
}