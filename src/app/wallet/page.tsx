
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PhantomWalletAssets from "@/components/phantom/Wallet";

export default function WalletPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <PhantomWalletAssets solana_address="5GhkB9Ke8V2GeGKhsr2Yy2bf53mMBHMnme3r18ESyhpa"/>
      </main>
      <Footer />
    </div>
  );
}
