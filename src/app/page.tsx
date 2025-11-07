
import HeroVideo from "@/components/home/HeroVideo";
import FeaturedCrypto from "@/components/home/FeaturedCrypto";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <main className="w-full">
        <HeroVideo />
        <FeaturedCrypto />
      </main>
      <Footer />
    </div>
  );
}
