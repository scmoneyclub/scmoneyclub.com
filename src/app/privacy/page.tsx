
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/page/Hero";
import PrivacyContent from "@/components/page/PrivacyContent";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <PageHero title="Privacy" />
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  );
}
  