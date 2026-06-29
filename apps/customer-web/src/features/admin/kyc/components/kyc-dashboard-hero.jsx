import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function KycDashboardHero() {
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">KYC Review Queue</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Review identity submissions, AI scores, and uploaded documents.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
