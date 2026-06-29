import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/features/admin/kyc/components/kyc-status-badges";

export default function AuditDetailHeader({ application, user }) {
  if (!application) return null;

  const shortId = String(application._id).slice(-8);
  const submittedAt = new Date(
    application.submittedAt || application.createdAt
  ).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <Card className="overflow-hidden border-border/80">
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Badge
            variant="secondary"
            className="rounded-full text-[11px] font-semibold uppercase tracking-wide"
          >
            Audit record
          </Badge>
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{application.name}</h1>
          <p className="truncate text-sm text-muted-foreground">
            {user?.email || "No email on file"}
          </p>
          <p className="text-[11px] tabular-nums text-muted-foreground/70">
            Submitted {submittedAt} · ID ···{shortId}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </CardContent>
    </Card>
  );
}
