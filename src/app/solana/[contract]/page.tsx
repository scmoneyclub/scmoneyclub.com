
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
// import TokenContainer from "@/components/token/Container";

export default async function SingleSolanaTokenPage({ params }: { params: Promise<{ 'contract': string }> }) {
  const { contract } = (await params);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar title="Token Details" />
        {/* <TokenContainer blockchain="sol" contract={contract} /> */}
      </main>
    </div>
  );
}
