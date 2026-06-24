import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { api, getApiError } from "../lib/api.js";
import { bankingApi } from "../lib/bankingApi.js";
import { investmentApi } from "../lib/investmentApi.js";
import { indices, tabs } from "../lib/marketData.js";
import { useAuth } from "../state/AuthContext.jsx";

function rupee(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Sparkline({ trend }) {
  return (
    <div className={`sparkline ${trend}`}>
      <span /><span /><span /><span /><span />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [bankForm, setBankForm] = useState({ accountHolderName: "", accountNumber: "", ifsc: "DEMO0000001" });
  const marketKey = searchParams.get("market") || "stocks";
  const market = tabs[marketKey] || tabs.stocks;

  const profileQuery = useQuery({
    queryKey: ["profile-me"],
    queryFn: () => api.get("/profile/me").then((response) => response.data.profile)
  });
  const bankQuery = useQuery({
    queryKey: ["banking-summary"],
    queryFn: bankingApi.summary,
    refetchInterval: 15000
  });
  const portfolioQuery = useQuery({
    queryKey: ["portfolio"],
    queryFn: investmentApi.portfolio
  });

  const account = bankQuery.data?.account;
  const profile = profileQuery.data;
  const kycVerified = profile?.kycStatus === "approved";
  const holdings = portfolioQuery.data || [];
  const investedTotal = holdings.reduce((sum, holding) => sum + Number(holding.totalAmount || 0), 0);
  const portfolioValue = holdings.reduce((sum, holding) => sum + Number(holding.currentPrice || 0) * Number(holding.quantity || 0), 0);

  const pendingCards = useMemo(
    () =>
      [
        !account
          ? {
              title: "Complete bank details",
              value: "Required",
              detail: "Connect one seeded account",
              icon: Landmark
            }
          : null,
        !kycVerified
          ? {
              title: "Complete KYC",
              value: "Pending",
              detail: "Required before investing",
              icon: ShieldCheck
            }
          : null,
        {
          title: "Portfolio value",
          value: rupee(portfolioValue),
          detail: holdings.length ? `${holdings.length} holdings` : "Starts after your first investment",
          icon: TrendingUp
        },
        {
          title: "Documents",
          value: kycVerified ? "Verified" : "Upload required",
          detail: "PAN and Aadhaar",
          icon: FileCheck2
        }
      ].filter(Boolean),
    [account, kycVerified]
  );

  const verifyBank = useMutation({
    mutationFn: bankingApi.verifyBank,
    onSuccess(data) {
      toast.success(data.message || "Bank account verified. Rs. 2 debited and refund will arrive soon.");
      queryClient.invalidateQueries({ queryKey: ["banking-summary"] });
      queryClient.invalidateQueries({ queryKey: ["navbar-bank-notifications"] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const buyStock = useMutation({
    mutationFn: investmentApi.buy,
    onSuccess() {
      toast.success("Investment placed successfully");
      queryClient.invalidateQueries({ queryKey: ["banking-summary"] });
      queryClient.invalidateQueries({ queryKey: ["navbar-app-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  function invest(item) {
    if (!kycVerified) {
      toast.error("Complete KYC before investing.");
      return;
    }

    if (!account) {
      toast.error("Complete bank details before investing.");
      return;
    }

    buyStock.mutate({ symbol: item.symbol, name: item.name, price: item.price, quantity: 1 });
  }

  return (
    <div className="app-surface">
      <Navbar />
      <div className="market-ticker">
        <div className="market-ticker-track">
          {[...indices, ...indices].map(([name, value, change], index) => (
            <span key={`${name}-${index}`}><strong>{name}</strong> {value} <em>{change}</em></span>
          ))}
        </div>
      </div>

      <main className="market-layout">
        <section className="market-hero-panel">
          <div>
            <p>{market.eyebrow}</p>
            <h1>{market.heading}</h1>
            <span>{market.subheading}</span>
          </div>
          <div className="market-hero-actions">
            <Link className="secondary-button compact-link" to="/banking">Banking</Link>
            <Link className="primary-button compact" to="/kyc">KYC</Link>
          </div>
        </section>

        <section className="market-grid pending-grid">
          {pendingCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="metric-card" key={card.title}>
                <div className="metric-icon">
                  <Icon size={21} />
                </div>
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </article>
            );
          })}
        </section>

        {!account ? (
          <section className="bank-panel priority-panel bank-connect-panel">
            <h2><Landmark size={18} /> Complete Bank Details</h2>
            <p className="muted">Enter a seeded dummy account. If it exists, the backend verifies it, debits Rs. 2, and refunds it automatically after a short demo delay.</p>
            <form
              className="bank-form"
              onSubmit={(event) => {
                event.preventDefault();
                verifyBank.mutate(bankForm);
              }}
            >
              <input placeholder="Account holder name" value={bankForm.accountHolderName} onChange={(event) => setBankForm({ ...bankForm, accountHolderName: event.target.value })} />
              <input placeholder="Account number" value={bankForm.accountNumber} onChange={(event) => setBankForm({ ...bankForm, accountNumber: event.target.value })} />
              <input placeholder="IFSC" value={bankForm.ifsc} onChange={(event) => setBankForm({ ...bankForm, ifsc: event.target.value.toUpperCase() })} />
              <button className="primary-button compact" type="submit" disabled={verifyBank.isPending}>
                Verify bank and debit Rs. 2
              </button>
            </form>
          </section>
        ) : null}

        <section className="market-content-grid">
          <div className="market-left">
            <section className="chart-panel">
              <div className="section-heading">
                <div>
                  <p>{market.label}</p>
                  <h2>{market.title || "Featured picks"}</h2>
                </div>
                <span className="live-pill">Mock Market</span>
              </div>
              <div className="stock-grid">
                {market.cards.map((item) => (
                  <div className="stock-card market-card" key={item.name}>
                    <div className="stock-symbol">{item.symbol}</div>
                    <Link to={`/stocks/${item.symbol}`}><strong>{item.name}</strong></Link>
                    <span>{rupee(item.price)}</span>
                    <p className={item.trend}>{item.change}</p>
                    <Sparkline trend={item.trend} />
                    <button type="button" onClick={() => invest(item)} disabled={!kycVerified || !account}>
                      {kycVerified && account ? market.button : "Locked"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="chart-panel">
              <div className="section-heading">
                <div>
                  <p>Market activity</p>
                  <h2>{marketKey === "mutual-funds" ? "SIP ideas" : "Top movers today"}</h2>
                </div>
              </div>
              <div className="transaction-table">
                <div className="transaction-row header market-row">
                  <span>Name</span><span>Price/Plan</span><span>Move/Risk</span><span>Volume/Return</span><span>Status</span><span>Action</span>
                </div>
                {market.movers.map((row) => (
                  <div className="transaction-row market-row" key={row[0]}>
                    <strong>{row[0]}</strong>
                    <span>{row[1]}</span>
                    <span className={String(row[2]).startsWith("-") ? "down" : "up"}>{row[2]}</span>
                    <span>{row[3]}</span>
                    <span>Live</span>
                    <Link className="table-link-button" to={`/stocks/${market.cards[0]?.symbol || "NGE"}`}>View</Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="chart-panel">
              <div className="section-heading">
                <div>
                  <p>Discovery</p>
                  <h2>{marketKey === "mutual-funds" ? "Fund categories" : "Sectors trending today"}</h2>
                </div>
              </div>
              <div className="sector-list">
                {market.sectors.map(([name, gainers, losers, change]) => (
                  <div className="sector-row" key={name}>
                    <strong>{name}</strong>
                    <div className="sector-bar">
                      <span style={{ width: `${Math.max(8, (gainers / Math.max(gainers + losers, 1)) * 100)}%` }} />
                      <em style={{ width: `${Math.max(8, (losers / Math.max(gainers + losers, 1)) * 100)}%` }} />
                    </div>
                    <p className={String(change).startsWith("-") ? "down" : "up"}>{change}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="market-right">
            <section className="watchlist-panel">
              <div className="section-heading">
                <div>
                  <p>Your investments</p>
                  <h2>{rupee(portfolioValue)}</h2>
                </div>
              </div>
              <div className="investment-snapshot">
                <span>1D returns <strong className="down">-0.41%</strong></span>
                <span>Total returns <strong className="down">-16.26%</strong></span>
                <span>Invested <strong>{rupee(investedTotal)}</strong></span>
                <span>Holdings <strong>{holdings.length}</strong></span>
              </div>
            </section>

            <section className="watchlist-panel">
              <h2>Products & Tools</h2>
              <div className="tool-list">
                {market.products.map(([name, tag, Icon]) => (
                  <Link to={name.includes("SIP") ? "/dashboard?market=mutual-funds" : "/dashboard"} key={name}>
                    <Icon size={19} />
                    <strong>{name}</strong>
                    <span>{tag}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="watchlist-panel">
              <h2>{marketKey === "mutual-funds" ? "SIP simulator" : "Trading screens"}</h2>
              <div className="screen-list">
                {["Resistance breakouts", "MACD above signal", "RSI overbought", "RSI oversold"].map((item, index) => (
                  <div key={item}>
                    <span className={index === 2 ? "bearish" : "bullish"}>{index === 2 ? "Bearish" : "Bullish"}</span>
                    <strong>{marketKey === "mutual-funds" ? item.replace("RSI", "SIP") : item}</strong>
                    <Sparkline trend={index === 2 ? "down" : "up"} />
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
