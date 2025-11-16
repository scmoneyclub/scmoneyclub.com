
import Header from "@/components/layout/Header";
import LoginForm from "@/components/form/Login";
import Footer from "@/components/layout/Footer";

export default function AccountPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
