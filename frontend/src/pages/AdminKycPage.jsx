import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, FileSearch, LogOut, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getApiError } from "../lib/api.js";
import { kycApi } from "../lib/kycApi.js";
import { useAuth } from "../state/AuthContext.jsx";

const apiBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:4000";

function getDocument(review, type) {
  return review?.documents?.find((document) => document.type === type);
}

function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

function statusLabel(status) {
  const map = {
    pending_admin_review: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    failed: "Failed",
    reupload_requested: "Reupload"
  };
  return map[status] || status || "Unknown";
}

function StatusTile({ icon: Icon, label, value, tone }) {
  return (
    <article className={`admin-stat ${tone || ""}`}>
      <Icon size={19} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function CheckPill({ label, value }) {
  return <span className={value ? "ok" : "bad"}>{label}: {value ? "Matched" : "Review"}</span>;
}

function ReviewValueRow({ label, entered, seeded, ocr, requireOcr = false }) {
  const baseMatched = normalize(entered) && normalize(entered) === normalize(seeded);
  const ocrMatched = !requireOcr || normalize(entered) === normalize(ocr);

  return (
    <div className="review-value-row">
      <strong>{label}</strong>
      <span>{entered || "Not entered"}</span>
      <span>{seeded || "Not found"}</span>
      <span>{ocr || "Not extracted"}</span>
      <em className={baseMatched && ocrMatched ? "ok" : "bad"}>{baseMatched && ocrMatched ? "OK" : "Review"}</em>
    </div>
  );
}

function UploadedDocument({ document }) {
  if (!document) {
    return null;
  }

  const src = `${apiBase}${document.url}`;
  const isImage = /\.(png|jpe?g|webp)$/i.test(document.url || "");

  return (
    <div className="admin-document-card">
      <div>
        <strong>{document.type.toUpperCase()} Upload</strong>
        <a href={src} target="_blank" rel="noreferrer">Open file</a>
      </div>
      {isImage ? <img src={src} alt={`${document.type} upload`} /> : <div className="pdf-placeholder">PDF document</div>}
    </div>
  );
}

function RawOcrBlock({ title, document }) {
  return (
    <div className="raw-ocr-block">
      <div>
        <strong>{title}</strong>
        <span>{document?.extractionSource || "not_extracted"}</span>
      </div>
      <pre>{document?.ocrText || document?.ocrPreview || "No OCR text captured yet."}</pre>
    </div>
  );
}

export default function AdminKycPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const list = useQuery({ queryKey: ["admin-kyc-list"], queryFn: kycApi.adminList });
  const detail = useQuery({
    queryKey: ["admin-kyc-detail", selectedId],
    queryFn: () => kycApi.adminGet(selectedId),
    enabled: Boolean(selectedId)
  });

  useEffect(() => {
    if (!selectedId && list.data?.length) {
      setSelectedId(list.data[0]._id);
    }
  }, [list.data, selectedId]);

  const stats = useMemo(() => {
    const applications = list.data || [];
    return {
      total: applications.length,
      pending: applications.filter((item) => item.status === "pending_admin_review").length,
      approved: applications.filter((item) => item.status === "approved").length,
      rejected: applications.filter((item) => ["rejected", "failed"].includes(item.status)).length
    };
  }, [list.data]);

  const approve = useMutation({
    mutationFn: () => kycApi.approve(selectedId, remarks),
    onSuccess() {
      toast.success("KYC approved");
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-detail", selectedId] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const reject = useMutation({
    mutationFn: () => kycApi.reject(selectedId, remarks),
    onSuccess() {
      toast.success("KYC rejected");
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-detail", selectedId] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const selected = detail.data;
  const review = selected?.adminReview;
  const panDoc = getDocument(review, "pan");
  const aadhaarDoc = getDocument(review, "aadhaar");

  function signOut() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand-block">
          <span className="admin-logo">A</span>
          <strong>Admin Dashboard</strong>
        </div>
        <div className="admin-top-actions">
          <span>{user?.email}</span>
          <button type="button" onClick={signOut}>
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </header>

      <main className="admin-layout">
        <aside className="admin-sidebar">
          <section className="admin-profile-card">
            <div className="admin-avatar">{user?.name?.charAt(0)?.toUpperCase() || "A"}</div>
            <strong>{user?.name || "Admin"}</strong>
            <span>{user?.role || "admin"}</span>
            <p>{user?.email}</p>
          </section>

          <section className="admin-panel">
            <h2>Admin Details</h2>
            <div className="admin-detail-list">
              <span>Access</span>
              <strong>KYC Review</strong>
              <span>Module</span>
              <strong>Identity Verification</strong>
              <span>Action</span>
              <strong>Approve / Reject</strong>
            </div>
          </section>
        </aside>

        <section className="admin-main">
          <section className="admin-stat-grid">
            <StatusTile icon={UserRound} label="Users" value={stats.total} />
            <StatusTile icon={Clock3} label="Pending" value={stats.pending} tone="warning" />
            <StatusTile icon={CheckCircle2} label="Approved" value={stats.approved} tone="success" />
            <StatusTile icon={XCircle} label="Needs Review" value={stats.rejected} tone="danger" />
          </section>

          <section className="admin-workspace">
            <article className="admin-panel user-list-panel">
              <div className="admin-section-heading">
                <div>
                  <p>User List</p>
                  <h1>Admin Dashboard</h1>
                </div>
              </div>

              <div className="admin-user-list">
                {(list.data || []).map((item) => (
                  <button className={`admin-user-row ${selectedId === item._id ? "active" : ""}`} type="button" key={item._id} onClick={() => setSelectedId(item._id)}>
                    <span className="admin-user-avatar">{item.name?.charAt(0)?.toUpperCase() || "U"}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.user?.email || "No user email"}</p>
                      <small>{item.panNumber} / {item.aadhaarNumber}</small>
                    </div>
                    <em className={`status-chip ${item.status}`}>{statusLabel(item.status)}</em>
                  </button>
                ))}
                {list.isLoading ? <p className="muted">Loading users...</p> : null}
                {!list.isLoading && (list.data || []).length === 0 ? <p className="muted">No KYC users submitted yet.</p> : null}
              </div>
            </article>

            <article className="admin-panel review-panel">
              <div className="admin-section-heading">
                <div>
                  <p>Review</p>
                  <h1>User Details</h1>
                </div>
                {selected?.application?.status ? <span className={`status-chip ${selected.application.status}`}>{statusLabel(selected.application.status)}</span> : null}
              </div>

              {selected ? (
                <div className="admin-review-body">
                  <div className="admin-person-grid">
                    <div>
                      <span>Full Name</span>
                      <strong>{selected.application.name}</strong>
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>{selected.user?.email || "Not found"}</strong>
                    </div>
                    <div>
                      <span>Phone</span>
                      <strong>{selected.user?.phone || "Not found"}</strong>
                    </div>
                    <div>
                      <span>Submitted</span>
                      <strong>{new Date(selected.application.submittedAt || selected.application.createdAt).toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  <div className="kyc-checks">
                    <CheckPill label="Identity exists" value={review?.checks?.identityExists} />
                    <CheckPill label="Name" value={review?.checks?.nameMatchesDataset} />
                    <CheckPill label="PAN" value={review?.checks?.panMatchesDataset} />
                    <CheckPill label="Aadhaar" value={review?.checks?.aadhaarMatchesDataset} />
                    <CheckPill label="PAN OCR" value={review?.checks?.panOcrMatches} />
                    <CheckPill label="Aadhaar OCR" value={review?.checks?.aadhaarOcrMatches} />
                  </div>

                  <div className="review-value-table">
                    <div className="review-value-row header">
                      <strong>Field</strong>
                      <span>User entered</span>
                      <span>Database value</span>
                      <span>OCR extracted</span>
                      <em>Result</em>
                    </div>
                    <ReviewValueRow label="Name" entered={review?.entered?.name} seeded={review?.seeded?.name} ocr={panDoc?.extracted?.name || aadhaarDoc?.extracted?.name} />
                    <ReviewValueRow label="PAN" entered={review?.entered?.panNumber} seeded={review?.seeded?.panNumber} ocr={panDoc?.extracted?.panNumber} />
                    <ReviewValueRow label="Aadhaar" entered={review?.entered?.aadhaarNumber} seeded={review?.seeded?.aadhaarNumber} ocr={aadhaarDoc?.extracted?.aadhaarNumber} />
                  </div>

                  <div className="admin-doc-grid">
                    <UploadedDocument document={panDoc} />
                    <UploadedDocument document={aadhaarDoc} />
                  </div>

                  <div className="admin-ocr-grid">
                    <RawOcrBlock title="PAN OCR Extracted Data" document={panDoc} />
                    <RawOcrBlock title="Aadhaar OCR Extracted Data" document={aadhaarDoc} />
                  </div>

                  <textarea placeholder="Write admin remarks before action" value={remarks} onChange={(event) => setRemarks(event.target.value)} />

                  <div className="review-actions">
                    <button className="primary-button compact" type="button" disabled={approve.isPending || reject.isPending} onClick={() => approve.mutate()}>
                      <ShieldCheck size={17} />
                      Approve
                    </button>
                    <button className="secondary-button" type="button" disabled={approve.isPending || reject.isPending} onClick={() => reject.mutate()}>
                      <FileSearch size={17} />
                      Reject / Request Fix
                    </button>
                  </div>
                </div>
              ) : (
                <p className="muted">Select a user from the list to review uploaded documents and OCR extracted data.</p>
              )}
            </article>
          </section>
        </section>
      </main>
    </div>
  );
}
