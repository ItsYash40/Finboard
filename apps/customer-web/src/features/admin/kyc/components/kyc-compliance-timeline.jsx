"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/features/audit/api/audit-api";
import { actionLabel, formatActor, formatDetailsSummary } from "@/features/audit/lib/audit-formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function KycComplianceTimeline({ applicationId }) {
  const auditTrail = useQuery({
    queryKey: ["audit-trail", "kyc", applicationId],
    queryFn: () => auditApi.byResource("kyc", applicationId),
    enabled: Boolean(applicationId),
  });

  const entries = auditTrail.data || [];

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardDescription>Audit trail</CardDescription>
        <CardTitle>Compliance history</CardTitle>
      </CardHeader>
      <CardContent>
        {auditTrail.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !entries.length ? (
          <p className="text-sm text-muted-foreground">No compliance events recorded yet.</p>
        ) : (
          <div>
            {entries.map((entry, i) => {
              const isApproved = entry.action === "KYC_APPROVED";
              const isRejected = entry.action === "KYC_REJECTED";
              const summary = formatDetailsSummary(entry.details);

              return (
                <div key={entry._id} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < entries.length - 1 ? (
                    <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border/40" />
                  ) : null}

                  <div
                    className={cn(
                      "relative mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                      isApproved
                        ? "bg-[var(--primary-pale)]"
                        : isRejected
                          ? "bg-[var(--negative)]/10"
                          : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "size-1.5 rounded-full",
                        isApproved
                          ? "bg-[var(--positive-deep)]"
                          : isRejected
                            ? "bg-[var(--negative)]"
                            : "bg-muted-foreground"
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium">{actionLabel(entry.action)}</span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatActor(entry)}
                      {entry.ipAddress ? ` · IP ${entry.ipAddress}` : ""}
                    </p>
                    {summary ? <p className="mt-1 text-xs text-muted-foreground">{summary}</p> : null}
                    {entry.details?.remarks ? (
                      <p className="mt-1 text-xs text-muted-foreground/80 italic">
                        "{entry.details.remarks}"
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
