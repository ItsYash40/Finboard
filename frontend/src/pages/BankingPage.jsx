import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getApiError } from "../lib/api.js";
import { bankingApi } from "../lib/bankingApi.js";

function rupee(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BankingPage() {
  const queryClient = useQueryClient();
  const [transferForm, setTransferForm] = useState({ accountNumber: "", ifsc: "DEMO0000001", amount: "", remarks: "" });
  const [receiver, setReceiver] = useState(null);
  const [range, setRange] = useState("all");

  const summary = useQuery({ queryKey: ["banking-summary"], queryFn: bankingApi.summary, refetchInterval: 15000 });
  const transactions = useQuery({ queryKey: ["bank-transactions", range], queryFn: () => bankingApi.transactions(range), refetchInterval: 15000 });
  const account = summary.data?.account;

  const refreshBank = () => {
    queryClient.invalidateQueries({ queryKey: ["banking-summary"] });
    queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
    queryClient.invalidateQueries({ queryKey: ["navbar-bank-notifications"] });
  };

  const lookupReceiver = useMutation({
    mutationFn: bankingApi.lookup,
    onSuccess(data) {
      setReceiver(data);
      setTransferForm((current) => ({ ...current, ifsc: data.ifsc }));
      toast.success(`Receiver found: ${data.holderName}`);
    },
    onError(error) {
      setReceiver(null);
      toast.error(getApiError(error));
    }
  });

  const transferMutation = useMutation({
    mutationFn: bankingApi.transfer,
    onSuccess() {
      toast.success("Money sent successfully");
      setTransferForm({ accountNumber: "", ifsc: "DEMO0000001", amount: "", remarks: "" });
      setReceiver(null);
      refreshBank();
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  return (
    <div className="app-surface">
      <Navbar />
      <main className="banking-layout">
        <section className="bank-hero">
          <div>
            <p>Banking Section</p>
            <h1>Balance, transfers and history</h1>
          </div>
          <Link className="secondary-button admin-link" to="/profile?section=Bank%20Details">Manage Bank Accounts</Link>
        </section>

        {!account ? (
          <section className="bank-setup">
            <CreditCard size={34} />
            <h1>No verified bank account</h1>
            <p>Complete bank details on the dashboard or profile page first. After verification, balance and transfers will appear here.</p>
            <Link className="primary-button compact" to="/dashboard">Complete Bank Details</Link>
          </section>
        ) : (
          <>
            <section className="bank-grid two-col-bank">
              <article className="balance-card">
                <div className="bank-card-top">
                  <CreditCard size={22} />
                  <span>Verified Account</span>
                </div>
                <strong>{rupee(account.balance)}</strong>
                <p>{account.holderName} / {account.bankName || "Finboard Demo Bank"} / {account.accountNumber} / {account.ifsc}</p>
              </article>

              <article className="bank-panel">
                <h2><Send size={18} /> Send Money</h2>
                <form
                  className="bank-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    transferMutation.mutate(transferForm);
                  }}
                >
                  <div className="inline-action">
                    <input placeholder="Friend account number" value={transferForm.accountNumber} onChange={(event) => setTransferForm({ ...transferForm, accountNumber: event.target.value })} />
                    <button type="button" onClick={() => lookupReceiver.mutate(transferForm.accountNumber)} disabled={!transferForm.accountNumber || lookupReceiver.isPending}>Find</button>
                  </div>
                  {receiver ? <div className="receiver-chip">Sending to {receiver.holderName} / {receiver.bankName || "Finboard Demo Bank"} / {receiver.ifsc}</div> : null}
                  <input placeholder="Amount" type="number" min="1" value={transferForm.amount} onChange={(event) => setTransferForm({ ...transferForm, amount: event.target.value })} />
                  <input placeholder="Remarks" value={transferForm.remarks} onChange={(event) => setTransferForm({ ...transferForm, remarks: event.target.value })} />
                  <button className="primary-button compact" type="submit" disabled={transferMutation.isPending}>
                    Send money
                  </button>
                </form>
              </article>
            </section>

            <section className="bank-two-col single-panel">
              <article className="bank-panel">
                <div className="section-heading">
                  <h2>Transaction History</h2>
                  <select value={range} onChange={(event) => setRange(event.target.value)}>
                    <option value="today">Today</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="month">Last Month</option>
                    <option value="all">All</option>
                  </select>
                </div>
                <div className="transaction-table">
                  <div className="transaction-row header">
                    <span>Date</span><span>Type</span><span>Amount</span><span>Account</span><span>Status</span><span>Remarks</span>
                  </div>
                  {(transactions.data || []).map((txn) => (
                    <div className="transaction-row" key={txn.id}>
                      <span>{new Date(txn.createdAt).toLocaleString("en-IN")}</span>
                      <strong className={txn.type === "CREDIT" ? "up" : "down"}>{txn.type}</strong>
                      <span>{rupee(txn.amount)}</span>
                      <span>{txn.type === "CREDIT" ? txn.senderAccountNumber || "-" : txn.receiverAccountNumber || "-"}</span>
                      <span>{txn.status}</span>
                      <span>{txn.remarks || txn.description}</span>
                    </div>
                  ))}
                  {!transactions.data?.length ? <p className="profile-loading">No transactions yet.</p> : null}
                </div>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
