export const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending_admin_review", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export function maskId(value) {
  const raw = String(value || "").replace(/\s/g, "");
  if (raw.length <= 4) return raw || "—";
  return `···· ${raw.slice(-4)}`;
}

export function timeAgo(dateString) {
  if (!dateString) return "";
  const s = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function getRiskLevel(item) {
  const score = item.aiVerification?.overallScore;
  const rec = item.aiVerification?.recommendation;
  if (rec === "reject" || (typeof score === "number" && score < 40)) return "high";
  if (rec === "review" || (typeof score === "number" && score < 70)) return "medium";
  return "low";
}

export function getPriorityTag(item) {
  if (item.status !== "pending_admin_review") return null;
  const risk = getRiskLevel(item);
  if (risk === "high") {
    return { text: "High Risk", cls: "text-[var(--negative)] bg-[var(--negative)]/10" };
  }
  if (risk === "medium") {
    return { text: "Needs Review", cls: "text-[var(--warning)] bg-[var(--warning)]/10" };
  }
  return null;
}

export function getFilterCounts(applications) {
  const apps = applications || [];
  return {
    all: apps.length,
    pending_admin_review: apps.filter((a) => a.status === "pending_admin_review").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => ["rejected", "failed"].includes(a.status)).length,
  };
}

export function computeKycStats(applications) {
  const apps = applications || [];
  return {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending_admin_review").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => ["rejected", "failed"].includes(a.status)).length,
  };
}

export function filterKycApplications(applications, { searchQuery = "", statusFilter = "all" } = {}) {
  let items = applications || [];

  if (statusFilter === "pending_admin_review") {
    items = items.filter((a) => a.status === "pending_admin_review");
  } else if (statusFilter === "approved") {
    items = items.filter((a) => a.status === "approved");
  } else if (statusFilter === "rejected") {
    items = items.filter((a) => ["rejected", "failed"].includes(a.status));
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.user?.email?.toLowerCase().includes(q) ||
        a.panNumber?.toLowerCase().includes(q) ||
        a.aadhaarNumber?.toLowerCase().includes(q)
    );
  }

  return items;
}

export function getDocument(review, type) {
  return review?.documents?.find((d) => d.type === type);
}

export function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

export function isKycReviewable(status) {
  return status === "pending_admin_review";
}
