import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header"
import PageHero from "@/components/page/Hero";

export default function AboutPage() {

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <PageHero title="About"/>
        <section className="py-12">
          <div className="text-center">
            {/* <h2 className="text-3xl font-bold">About</h2> */}
            <p className="text-lg">A private club of action takers who want the very best out of life.</p>
          </div>
        </section>  
      </main>
      <Footer />
    </div>
  );
}