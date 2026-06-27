"use client";

import { AlertTriangle, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./kyc-status-badges";

function RecommendationChip({ recommendation, score }) {
  const config = {
    approve: {
      label: "Approve",
      Icon: CheckCircle2,
      cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-950/40 dark:text-emerald-200",
    },
    review: {
      label: "Needs Review",
      Icon: AlertTriangle,
      cls: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:border-amber-400/25 dark:bg-amber-950/40 dark:text-amber-100",
    },
    reject: {
      label: "Reject",
      Icon: XCircle,
      cls: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-200",
    },
  };
  const { label, Icon, cls } = config[recommendation] ?? {
    label: "Not scored",
    Icon: Sparkles,
    cls: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold",
        cls
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>AI: {label}</span>
      {typeof score === "number" ? (
        <span className="ml-1 text-[11px] font-normal opacity-70 tabular-nums">({score}%)</span>
      ) : null}
    </div>
  );
}

export default function KycReviewHeader({ application, user, aiVerification }) {
  const submittedAt = new Date(
    application.submittedAt || application.createdAt
  ).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const shortId = String(application._id).slice(-8);

  return (
    <Card className="overflow-hidden border-border/80">
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-12 shrink-0">
            <AvatarFallback className="text-sm font-bold">
              {application.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {application.name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {user?.email || "No email on file"}
            </p>
            <p className="mt-1 text-[11px] tabular-nums text-muted-foreground/70">
              Submitted {submittedAt} · ID ···{shortId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <RecommendationChip
            recommendation={aiVerification?.recommendation}
            score={aiVerification?.overallScore}
          />
          <StatusBadge status={application.status} />
        </div>
      </CardContent>
    </Card>
  );
}
