import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AuditDashboardHero() {
  return (
    <Card className="overflow-hidden border-border/80">
      <CardContent className="flex flex-wrap items-end justify-between gap-4 pt-6">
        <div className="space-y-1">
          <Badge
            variant="secondary"
            className="rounded-full text-[11px] font-semibold uppercase tracking-wide"
          >
            Compliance
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Audit Trail Explorer</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Look up append-only compliance history for KYC submissions, approvals, and rejections.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
