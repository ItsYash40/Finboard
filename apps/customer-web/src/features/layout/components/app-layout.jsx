import { cn } from "@/lib/utils";
import Footer from "./footer";
import MarketTicker from "./market-ticker";
import Navbar from "./navbar";
import { pageContainer } from "../lib/responsive";

export default function AppLayout({ children }) {
  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      style={{ "--ticker-height": "2.25rem" }}
    >
      <Navbar />
      <MarketTicker />
      <main className={cn(pageContainer, "flex-1")}>{children}</main>
      <Footer />
    </div>
  );
}
