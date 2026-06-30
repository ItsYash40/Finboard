"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { auditApi } from "../api/audit-api";
import {
  actionLabel,
  actionTone,
  formatActor,
  formatAiVerificationSummary,
  formatDetailsSummary
} from "../lib/audit-formatters";

function AuditEntryDetails({ entry }) {
  const summary = formatDetailsSummary(entry.details);
  const aiSummary = formatAiVerificationSummary(entry.details?.aiVerification);
  const hasRawDetails = entry.details && Object.keys(entry.details).length > 0;

  return (
    <div className="space-y-2">
      {summary ? <p className="text-sm text-muted-foreground">{summary}</p> : null}
      {aiSummary ? <p className="text-sm text-muted-foreground">{aiSummary}</p> : null}
      {hasRawDetails ? (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <ChevronDown className="size-3" />
            View full event details
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 max-h-40 overflow-x-auto overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 text-xs whitespace-pre-wrap text-muted-foreground">
              {JSON.stringify(entry.details, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
}

export function AuditTrail({ resourceType, resourceId, className, title = "Audit Trail" }) {
  const auditTrail = useQuery({
    queryKey: ["audit-trail", resourceType, resourceId],
    queryFn: () => auditApi.byResource(resourceType, resourceId),
    enabled: Boolean(resourceType && resourceId)
  });

  const entries = auditTrail.data || [];

  return (
    <Card className={cn("border-border/80", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardDescription>Append-only event log</CardDescription>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4" />
            {title}
          </CardTitle>
        </div>
        <Badge variant="secondary" className="rounded-full tabular-nums">
          {entries.length} events
        </Badge>
      </CardHeader>
      <CardContent>
        {auditTrail.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading audit history…</p>
        ) : null}
        {auditTrail.isError ? (
          <p className="text-sm text-rose-700 dark:text-rose-200">{getApiError(auditTrail.error)}</p>
        ) : null}
        {!auditTrail.isLoading && !auditTrail.isError && entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
        ) : null}
        <div>
          {entries.map((entry, index) => (
            <div
              key={entry._id}
              className={cn(
                "relative space-y-2 py-4",
                index < entries.length - 1 && "border-b border-border/40"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline" className={cn("rounded-full font-medium", actionTone(entry.action))}>
                  {actionLabel(entry.action)}
                </Badge>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Actor: {formatActor(entry)}
                {entry.ipAddress ? ` · IP ${entry.ipAddress}` : ""}
              </p>
              <AuditEntryDetails entry={entry} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
