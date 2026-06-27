import Footer from "./footer";
import MarketTicker from "./market-ticker";
import Navbar from "./navbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <MarketTicker />
      <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <Footer />
    </div>
  );
}
