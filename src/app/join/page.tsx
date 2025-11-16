
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/page/Hero";
import Link from "next/link";
import ValidateInvite from "@/components/auth/ValidateInvite";

export default function JoinPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <PageHero title="Join" />
        <section className="py-12">
          <div className="container max-w-2xl mx-auto">
            <ValidateInvite />
            <div className="text-center mt-6">
              <p className="text-sm text-gray-300">Already have an account? <Link href="/login" className="text-white underline">Login</Link></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
  