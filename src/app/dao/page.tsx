
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
import DAOContainer from "@/components/dao/Container";

export default function DAOPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar title="Decentralized Autonomous Organization" showSearch={false} />
        <DAOContainer />
      </main>
    </div>
  );
}
