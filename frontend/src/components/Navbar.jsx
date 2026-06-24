import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronRight, FileCheck2, Landmark, LogOut, Search, Settings, UserRound, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { bankingApi } from "../lib/bankingApi.js";
import { instruments, tabs } from "../lib/marketData.js";
import { notificationApi } from "../lib/notificationApi.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const bankNotifications = useQuery({
    queryKey: ["navbar-bank-notifications"],
    queryFn: bankingApi.notifications,
    enabled: Boolean(user),
    refetchInterval: 15000
  });
  const appNotifications = useQuery({
    queryKey: ["navbar-app-notifications"],
    queryFn: notificationApi.app,
    enabled: Boolean(user),
    refetchInterval: 15000
  });

  const dismissNotification = useMutation({
    mutationFn: (item) => (item.source === "banking" ? bankingApi.dismissNotification(item.id) : notificationApi.dismiss(item.id)),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["navbar-bank-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["navbar-app-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["bank-notifications"] });
    }
  });

  const mergedNotifications = [
    ...(appNotifications.data || []).map((item) => ({ ...item, id: item._id || item.id, source: "app" })),
    ...(bankNotifications.data || []).map((item) => ({ ...item, source: "banking" }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = mergedNotifications.filter((item) => !item.read).length || 0;

  function handleLogout() {
    logout();
    navigate("/signin");
  }

  function openProfile(section) {
    setProfileOpen(false);
    navigate(section ? `/profile?section=${encodeURIComponent(section)}` : "/profile");
  }

  function marketClass(key) {
    const params = new URLSearchParams(location.search);
    const current = params.get("market") || "stocks";
    return location.pathname === "/dashboard" && current === key ? "active" : "";
  }

  const searchable = [...instruments, ...tabs.fo.cards];
  const searchResults = search.trim()
    ? searchable
        .filter((item) => `${item.name} ${item.symbol}`.toLowerCase().includes(search.trim().toLowerCase()))
        .slice(0, 6)
    : [];

  function openInstrument(symbol) {
    setSearch("");
    navigate(`/stocks/${symbol}`);
  }

  return (
    <header className="topbar">
      <Link to="/dashboard" className="logo" aria-label="KYC home">
        <span />
      </Link>
      <nav className="market-nav">
        <Link to="/dashboard?market=stocks" className={marketClass("stocks")}>Stocks</Link>
        <Link to="/dashboard?market=fo" className={marketClass("fo")}>F&amp;O</Link>
        <Link to="/dashboard?market=mutual-funds" className={marketClass("mutual-funds")}>Mutual Funds</Link>
        <NavLink to="/banking">Banking</NavLink>
      </nav>
      <div className="topbar-spacer" />
      <label className="search-box">
        <Search size={18} />
        <input type="search" placeholder="Search investments..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <kbd>Ctrl+K</kbd>
      </label>
      {searchResults.length ? (
        <div className="search-popover">
          {searchResults.map((item) => (
            <button type="button" key={item.symbol} onClick={() => openInstrument(item.symbol)}>
              <span>{item.symbol}</span>
              <strong>{item.name}</strong>
              <em>{item.exchange}</em>
            </button>
          ))}
        </div>
      ) : null}
      <button className="icon-button" type="button" aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}>
        <Bell size={19} />
        {unreadCount ? <span className="badge">{Math.min(unreadCount, 9)}</span> : null}
      </button>
      {notificationsOpen ? (
        <div className="notification-popover">
          <div className="popover-header">
            <strong>Notifications</strong>
            <Link to="/banking" onClick={() => setNotificationsOpen(false)}>View banking</Link>
          </div>
          <div className="popover-list">
            {mergedNotifications.slice(0, 10).map((item) => (
              <div className="popover-note dismissible" key={`${item.source}-${item.id}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                </div>
                <button type="button" aria-label="Remove notification" onClick={() => dismissNotification.mutate(item)}>
                  <X size={15} />
                </button>
              </div>
            ))}
            {!mergedNotifications.length ? <p className="muted">No notifications yet.</p> : null}
          </div>
        </div>
      ) : null}

      <button className="avatar-link" type="button" aria-label="Open profile menu" onClick={() => setProfileOpen((value) => !value)}>
        {user?.name?.charAt(0)?.toUpperCase() || <UserRound size={18} />}
      </button>
      {profileOpen ? (
        <div className="profile-popover">
          <div className="profile-popover-head">
            <div>
              <strong>{user?.name || "Investor"}</strong>
              <span>{user?.email}</span>
            </div>
            <button type="button" onClick={() => openProfile()}>
              <Settings size={16} />
            </button>
          </div>
          <button type="button" onClick={() => openProfile("Basic Details")}>
            <UserRound size={17} />
            Profile Details
            <ChevronRight size={16} />
          </button>
          <button type="button" onClick={() => openProfile("Bank Details")}>
            <Landmark size={17} />
            Bank Details
            <ChevronRight size={16} />
          </button>
          <button type="button" onClick={() => navigate("/kyc")}>
            <FileCheck2 size={17} />
            KYC Verification
            <ChevronRight size={16} />
          </button>
          <button type="button" onClick={() => navigate("/banking")}>
            <WalletCards size={17} />
            Banking Section
            <ChevronRight size={16} />
          </button>
          {user?.role === "admin" ? (
            <button type="button" onClick={() => navigate("/admin/kyc")}>
              <ShieldIcon />
              Admin Review
              <ChevronRight size={16} />
            </button>
          ) : null}
          <div className="profile-popover-foot">
            <button type="button" onClick={handleLogout}>
              <LogOut size={17} />
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function ShieldIcon() {
  return <span className="mini-shield">A</span>;
}
