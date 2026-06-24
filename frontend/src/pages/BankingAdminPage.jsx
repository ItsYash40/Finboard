import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { bankingApi } from "../lib/bankingApi.js";
import { getApiError } from "../lib/api.js";

function rupee(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BankingAdminPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["bank-admin-users"], queryFn: bankingApi.adminUsers });
  const transactions = useQuery({ queryKey: ["bank-admin-transactions"], queryFn: bankingApi.adminTransactions });

  const freeze = useMutation({
    mutationFn: ({ id, frozen }) => bankingApi.freeze(id, frozen),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["bank-admin-users"] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const totalMoney = (users.data || []).reduce((sum, account) => sum + Number(account.balance), 0);

  return (
    <div className="app-surface">
      <Navbar />
      <main className="banking-layout">
        <section className="bank-hero">
          <div>
            <p>Admin Core Banking View</p>
            <h1>Accounts, balances and controls</h1>
          </div>
          <a className="secondary-button admin-link" href="/banking">Back to Banking</a>
        </section>
        <section className="market-grid">
          <article className="metric-card"><span>Total bank money</span><strong>{rupee(totalMoney)}</strong><p>Across seeded accounts</p></article>
          <article className="metric-card"><span>Accounts</span><strong>{users.data?.length || 0}</strong><p>Admin and customers</p></article>
          <article className="metric-card"><span>Transactions</span><strong>{transactions.data?.length || 0}</strong><p>Latest 200 records</p></article>
          <article className="metric-card"><span>Frozen</span><strong>{(users.data || []).filter((a) => a.status === "FROZEN").length}</strong><p>Blocked accounts</p></article>
        </section>
        <section className="bank-panel">
          <h2>All Accounts</h2>
          <div className="transaction-table">
            <div className="transaction-row header"><span>Name</span><span>Account</span><span>IFSC</span><span>Balance</span><span>Status</span><span>Action</span></div>
            {(users.data || []).map((account) => (
              <div className="transaction-row" key={account.id}>
                <span>{account.holderName}</span>
                <span>{account.accountNumber}</span>
                <span>{account.ifsc}</span>
                <strong>{rupee(account.balance)}</strong>
                <span>{account.status}</span>
                <button type="button" onClick={() => freeze.mutate({ id: account.id, frozen: account.status !== "FROZEN" })}>
                  {account.status === "FROZEN" ? "Unfreeze" : "Freeze"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

