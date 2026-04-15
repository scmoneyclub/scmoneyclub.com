
import Header from "@/components/layout/Header";
import LoginForm from "@/components/form/Login";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/page/Hero";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <PageHero title="Login" />
        <section className="py-12">
          <div className="container max-w-2xl mx-auto">
            <LoginForm />
            <div className="text-center mt-6">
              <p className="text-sm text-gray-300">Don&apos;t have an account? <Link href="/join" className="text-white underline">Create Account</Link></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
  
