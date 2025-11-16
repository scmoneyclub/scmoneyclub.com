
import TradingTopbar from "@/components/trading/Topbar";
import TradingSidebar from "@/components/trading/Sidebar";
import LoginForm from "@/components/form/Login";

export default function AccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar />
        <section className="p-4">
          <LoginForm />
        </section>
      </main>
    </div>
  );
}
