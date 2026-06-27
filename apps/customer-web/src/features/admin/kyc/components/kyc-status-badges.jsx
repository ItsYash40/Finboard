import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function statusLabel(status) {
  const map = {
    pending_admin_review: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    failed: "Failed",
    reupload_requested: "Reupload",
  };
  return map[status] || status || "Unknown";
}

export function statusBadgeClass(status) {
  const map = {
    pending_admin_review:
      "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:border-amber-400/25 dark:bg-amber-950/40 dark:text-amber-100",
    approved:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-950/40 dark:text-emerald-200",
    rejected:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-200",
    failed:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-200",
    reupload_requested:
      "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:border-amber-400/25 dark:bg-amber-950/40 dark:text-amber-100",
  };
  return map[status] || "";
}

export function StatusBadge({ status }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", statusBadgeClass(status))}>
      {statusLabel(status)}
    </Badge>
  );
}

export function recommendationLabel(recommendation) {
  const map = { approve: "Recommend Approve", review: "Needs Review", reject: "Recommend Reject" };
  return map[recommendation] || "Not scored";
}

export function scoreToneClass(score) {
  if (score >= 80) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-950/40 dark:text-emerald-200";
  }
  if (score >= 50) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:border-amber-400/25 dark:bg-amber-950/40 dark:text-amber-100";
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-200";
}

export function recommendationBadgeClass(recommendation) {
  const map = {
    approve:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-950/40 dark:text-emerald-200",
    review:
      "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:border-amber-400/25 dark:bg-amber-950/40 dark:text-amber-100",
    reject:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-200",
  };
  return map[recommendation] || "border-border bg-secondary text-muted-foreground";
}

export function formatScore(score) {
  return typeof score === "number" ? `${score}%` : "N/A";
}

export function AiScoreBadge({ score }) {
  if (typeof score !== "number") return null;
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium tabular-nums", scoreToneClass(score))}
    >
      {formatScore(score)}
    </Badge>
  );
}

export function CompareResultBadge({ ok }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 rounded-full",
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-950/40 dark:text-emerald-200"
          : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-200"
      )}
    >
      {ok ? "✓ Match" : "✗ Mismatch"}
    </Badge>
  );
}
