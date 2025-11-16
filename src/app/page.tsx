import Header from "@/components/layout/Header";
import HeroVideo from "@/components/home/HeroVideo";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <HeroVideo />
      </main>
      <Footer />
    </div>
  );
}
