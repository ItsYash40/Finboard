import { FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { isKycReviewable } from "../lib/kyc-admin-formatters";
import { StatusBadge } from "./kyc-status-badges";

export default function KycDecisionFooter({
  status,
  aiVerification,
  remarks,
  onRemarksChange,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) {
  const isReviewable = isKycReviewable(status);
  const actionsDisabled = isApproving || isRejecting || !isReviewable;

  return (
    <Card className="sticky bottom-4 border-border/80 shadow-lg">
      <CardHeader>
        <CardDescription>Admin decision</CardDescription>
        <CardTitle>Approve or reject</CardTitle>
      </CardHeader>
      <CardContent>
        {isReviewable ? (
          <div className="space-y-3">
            {aiVerification?.recommendation ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 shrink-0" aria-hidden />
                <span>
                  AI recommends{" "}
                  <strong
                    className={cn(
                      aiVerification.recommendation === "approve"
                        ? "text-[var(--positive-deep)]"
                        : aiVerification.recommendation === "reject"
                          ? "text-[var(--negative)]"
                          : "text-[var(--warning)]"
                    )}
                  >
                    {aiVerification.recommendation}
                  </strong>
                </span>
              </div>
            ) : null}

            <div>
              <Label
                htmlFor="kyc-remarks"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Admin notes (required for rejection)
              </Label>
              <Textarea
                id="kyc-remarks"
                placeholder="Document quality issue, field mismatch reason, or approval context…"
                value={remarks}
                onChange={(e) => onRemarksChange(e.target.value)}
                className="min-h-[68px] resize-none text-sm"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={actionsDisabled}
                onClick={onReject}
                className="flex-1 gap-2"
              >
                <FileSearch className="size-4" aria-hidden />
                {isRejecting ? "Rejecting…" : "Reject / Request fix"}
              </Button>
              <Button
                type="button"
                disabled={actionsDisabled}
                onClick={onApprove}
                className="flex-1 gap-2"
              >
                <ShieldCheck className="size-4" aria-hidden />
                {isApproving ? "Approving…" : "Approve"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            <p className="text-sm text-muted-foreground">
              This application has already been reviewed. No further action is required.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
