import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Bookmark, CalendarDays, Link as LinkIcon } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { api, getApiError } from "../lib/api.js";
import { bankingApi } from "../lib/bankingApi.js";
import { investmentApi } from "../lib/investmentApi.js";
import { findInstrument } from "../lib/marketData.js";

function rupee(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateChart(trend) {
  const points = trend === "down"
    ? [76, 66, 70, 58, 62, 44, 49, 39, 42, 28, 34, 31, 25, 33, 22, 30]
    : [34, 42, 39, 51, 48, 62, 57, 68, 65, 76, 72, 82, 78, 88, 84, 92];

  return points.map((y, index) => `${index * 44},${100 - y}`).join(" ");
}

export default function StockDetailPage() {
  const { symbol } = useParams();
  const item = findInstrument(symbol);
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const profileQuery = useQuery({
    queryKey: ["profile-me"],
    queryFn: () => api.get("/profile/me").then((response) => response.data.profile)
  });
  const bankQuery = useQuery({ queryKey: ["banking-summary"], queryFn: bankingApi.summary, refetchInterval: 15000 });
  const portfolioQuery = useQuery({ queryKey: ["portfolio"], queryFn: investmentApi.portfolio });

  const buy = useMutation({
    mutationFn: investmentApi.buy,
    onSuccess() {
      toast.success(`${item.symbol} added to portfolio`);
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["banking-summary"] });
      queryClient.invalidateQueries({ queryKey: ["navbar-app-notifications"] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const account = bankQuery.data?.account;
  const kycApproved = profileQuery.data?.kycStatus === "approved";
  const owned = useMemo(
    () => (portfolioQuery.data || []).filter((holding) => holding.symbol === item?.symbol).reduce((sum, holding) => sum + Number(holding.quantity || 0), 0),
    [portfolioQuery.data, item?.symbol]
  );

  if (!item) {
    return <Navigate to="/dashboard" replace />;
  }

  const amount = item.price * Number(quantity || 0);
  const canBuy = Boolean(account && kycApproved && quantity > 0 && !buy.isPending);

  function submitOrder(event) {
    event.preventDefault();
    if (!kycApproved) {
      toast.error("Complete KYC approval before buying.");
      return;
    }
    if (!account) {
      toast.error("Complete bank verification before buying.");
      return;
    }
    buy.mutate({ symbol: item.symbol, name: item.name, price: item.price, quantity: Number(quantity) });
  }

  return (
    <div className="app-surface">
      <Navbar />
      <main className="stock-detail-layout">
        <section className="stock-detail-main">
          <div className="stock-title-row">
            <div className="stock-symbol large">{item.symbol}</div>
            <div>
              <p>{item.symbol} / {item.exchange}</p>
              <h1>{item.name}</h1>
              <strong>{rupee(item.price)} <span className={item.trend}>{item.change}</span></strong>
            </div>
            <div className="stock-actions">
              <button type="button"><LinkIcon size={17} /></button>
              <button type="button"><Bell size={17} /></button>
              <button type="button"><Bookmark size={17} /></button>
            </div>
          </div>

          <div className="large-chart">
            <svg viewBox="0 0 660 120" preserveAspectRatio="none">
              <polyline points={generateChart(item.trend)} />
            </svg>
          </div>

          <div className="range-tabs">
            {["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "All"].map((range) => (
              <button className={range === "1D" ? "active" : ""} type="button" key={range}>{range}</button>
            ))}
          </div>

          <Link className="stock-sip-card" to="/dashboard?market=mutual-funds">
            <CalendarDays size={22} />
            <div>
              <strong>Create Stock SIP</strong>
              <p>Automate monthly investments in this instrument</p>
            </div>
            <span>Open</span>
          </Link>

          <section className="stock-info-tabs">
            <nav>
              {["Overview", "Technicals", "News", "Events", "F&O"].map((tab, index) => (
                <button className={index === 0 ? "active" : ""} type="button" key={tab}>{tab}</button>
              ))}
            </nav>
            <div className="performance-band">
              <h2>Performance</h2>
              <div>
                <span>Today's low <strong>{rupee(item.low)}</strong></span>
                <div className="performance-line"><i /></div>
                <span>Today's high <strong>{rupee(item.high)}</strong></span>
              </div>
            </div>
          </section>
        </section>

        <aside className="order-panel">
          <div className="order-head">
            <strong>{item.symbol}</strong>
            <span>{item.exchange} {rupee(item.price)}</span>
          </div>
          <div className="order-tabs">
            <button className="active" type="button">BUY</button>
            <button type="button">SELL</button>
          </div>
          <form className="order-form" onSubmit={submitOrder}>
            <div className="order-mode-row">
              <span>Delivery</span>
              <span>Intraday</span>
              <span>MTF 3.89x</span>
            </div>
            <label>
              Qty
              <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            </label>
            <label>
              Price Limit
              <input value={item.price.toFixed(2)} readOnly />
            </label>
            <div className="order-summary">
              <span>Balance: {account ? rupee(account.balance) : "Not linked"}</span>
              <span>Approx req: {rupee(amount)}</span>
              <span>Owned: {owned}</span>
            </div>
            {!kycApproved ? <p className="order-warning">KYC approval required before buying.</p> : null}
            {!account ? <p className="order-warning">Verify bank account before buying.</p> : null}
            <button className="primary-button" type="submit" disabled={!canBuy}>
              {buy.isPending ? "Buying..." : "Buy"}
            </button>
          </form>
        </aside>
      </main>
    </div>
  );
}
