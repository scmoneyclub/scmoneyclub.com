
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PhantomConnect from "@/components/phantom/Connect";

export default function ConnectPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <PhantomConnect />
      </main>
      <Footer />
    </div>
  );
}
