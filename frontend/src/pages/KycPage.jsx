import { useMutation, useQuery } from "@tanstack/react-query";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { getApiError } from "../lib/api.js";
import { kycApi } from "../lib/kycApi.js";

export default function KycPage() {
  const [form, setForm] = useState({ name: "", panNumber: "", aadhaarNumber: "", panFile: null, aadhaarFile: null });
  const current = useQuery({ queryKey: ["my-kyc"], queryFn: kycApi.me });
  const submit = useMutation({
    mutationFn: kycApi.submit,
    onSuccess() {
      toast.success("KYC submitted for admin review");
      current.refetch();
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const application = current.data;

  function submitKyc(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.panNumber.trim() || !form.aadhaarNumber.trim()) {
      toast.error("Enter name, PAN, and Aadhaar before submitting.");
      return;
    }

    if (!form.panFile || !form.aadhaarFile) {
      toast.error("Upload both PAN and Aadhaar documents.");
      return;
    }

    submit.mutate(form);
  }

  return (
    <div className="app-surface">
      <Navbar />
      <main className="banking-layout">
        <section className="bank-hero">
          <div>
            <p>Identity Verification</p>
            <h1>Complete KYC</h1>
          </div>
        </section>

        <section className="onboarding-flow dashboard-onboarding">
          <article className="bank-panel priority-panel">
            <h2><ShieldCheck size={18} /> Manual Details</h2>
            <form
              className="bank-form"
              onSubmit={submitKyc}
            >
              <input placeholder="Name as per PAN/Aadhaar" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <input placeholder="PAN number" value={form.panNumber} onChange={(event) => setForm({ ...form, panNumber: event.target.value.toUpperCase() })} />
              <input placeholder="Aadhaar number" value={form.aadhaarNumber} onChange={(event) => setForm({ ...form, aadhaarNumber: event.target.value })} />
              <label className="file-input-label">
                PAN card image
                <input type="file" accept="image/*,.pdf" onChange={(event) => setForm({ ...form, panFile: event.target.files?.[0] })} />
              </label>
              <label className="file-input-label">
                Aadhaar card image
                <input type="file" accept="image/*,.pdf" onChange={(event) => setForm({ ...form, aadhaarFile: event.target.files?.[0] })} />
              </label>
              <button className="primary-button compact" type="submit" disabled={submit.isPending}>
                {submit.isPending ? "Submitting..." : "Submit KYC"}
              </button>
            </form>
          </article>

          <article className="bank-panel priority-panel">
            <h2><FileCheck2 size={18} /> Current Status</h2>
            {application ? (
              <div className="kyc-status-box">
                <strong>{application.status.replaceAll("_", " ").toUpperCase()}</strong>
                <p>{application.failureReason || "Your submitted values, OCR values, and dataset checks are stored for admin review."}</p>
                <div className="kyc-checks">
                  {Object.entries(application.checks || {}).map(([key, value]) => (
                    <span className={value ? "ok" : "bad"} key={key}>{key}: {String(value)}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="muted">No KYC application submitted yet.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
