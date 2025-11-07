
import HeroVideo from "@/components/home/HeroVideo";
import FeaturedCrypto from "@/components/home/FeaturedCrypto";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <main className="w-full">
        <HeroVideo />
        <FeaturedCrypto />
      </main>
    </div>
  );
}
