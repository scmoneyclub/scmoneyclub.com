import Header from "@/components/layout/Header";
import HeroVideo from "@/components/home/HeroVideo";
import ArtificialIntelligence from "@/components/investments/ArtificialIntelligence";
import CryptocurrencyInvestments from "@/components/investments/Cryptocurrency";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <HeroVideo />
        <ArtificialIntelligence />
        <CryptocurrencyInvestments showFeatures={false}/>
      </main>
      <Footer />
    </div>
  );
}
