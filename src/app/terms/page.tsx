
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/page/Hero";
import TermsContent from "@/components/page/TermsContent";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <PageHero title="Terms of Service" />
        <TermsContent />
      </main>
      <Footer />
    </div>
  );
}
  