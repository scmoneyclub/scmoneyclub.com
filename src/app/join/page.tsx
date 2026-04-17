
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/page/Hero";
import Link from "next/link";
import JoinFlow from "@/components/auth/JoinFlow";

export default function JoinPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <PageHero title="Join SC Money Club" />
        <section className="py-12">
          <div className="container max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Membership by Invitation</h2>
              <p className="text-sm text-gray-400">SC Money Club is an exclusive, invite-only investment community for serious crypto investors. Enter your invite code below to apply for membership.</p>
            </div>
            <JoinFlow />
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
  