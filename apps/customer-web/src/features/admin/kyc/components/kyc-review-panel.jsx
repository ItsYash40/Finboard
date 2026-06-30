"use client";

import { AlertCircle, Fingerprint } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getDocument } from "../lib/kyc-admin-formatters";
import KycAiVerification from "./kyc-ai-verification";
import KycComplianceTimeline from "./kyc-compliance-timeline";
import KycDecisionFooter from "./kyc-decision-footer";
import KycDocumentCards from "./kyc-document-cards";
import KycIdentitySnapshot from "./kyc-identity-snapshot";
import KycReviewHeader from "./kyc-review-header";
import KycVerificationMatrix from "./kyc-verification-matrix";

export { getDocument, isKycReviewable, normalize } from "../lib/kyc-admin-formatters";
export {
  AiScoreBadge,
  CompareResultBadge,
  formatScore,
  recommendationBadgeClass,
  recommendationLabel,
  scoreToneClass,
  statusBadgeClass,
  statusLabel,
  StatusBadge,
} from "./kyc-status-badges";

function ReviewPanelSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-3xl" />
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-40 w-full rounded-3xl" />
    </div>
  );
}

export function KycReviewPanel({
  selected,
  review,
  panDoc: panDocProp,
  aadhaarDoc: aadhaarDocProp,
  remarks,
  onRemarksChange,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  isLoading = false,
  isError = false,
  emptyMessage = "Select an application from the queue to review identity data, documents, and AI scores.",
  onRefreshDocuments,
}) {
  if (isLoading) return <ReviewPanelSkeleton />;

  if (isError) {
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-[var(--negative)]/20 bg-[var(--negative)]/5 p-5">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--negative)]" />
        <div>
          <p className="text-sm font-medium text-[var(--negative)]">Failed to load application</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Try opening the application again from the queue.
          </p>
        </div>
      </div>
    );
  }

  if (!selected) {
    return (
      <Empty className={cn("min-h-[420px] rounded-3xl border border-border/80 bg-card")}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Fingerprint />
          </EmptyMedia>
          <EmptyTitle>No application selected</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const panDoc = panDocProp ?? getDocument(review, "pan");
  const aadhaarDoc = aadhaarDocProp ?? getDocument(review, "aadhaar");
  const aiVerification = review?.aiVerification || selected?.application?.aiVerification;

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <KycReviewHeader
        application={selected.application}
        user={selected.user}
        aiVerification={aiVerification}
      />
      <KycIdentitySnapshot selected={selected} review={review} />
      <KycAiVerification aiVerification={aiVerification} />
      <KycVerificationMatrix review={review} panDoc={panDoc} aadhaarDoc={aadhaarDoc} />
      <KycDocumentCards
        panDoc={panDoc}
        aadhaarDoc={aadhaarDoc}
        onRefreshDocuments={onRefreshDocuments}
      />
      <KycComplianceTimeline applicationId={selected.application._id} />
      <KycDecisionFooter
        status={selected.application.status}
        aiVerification={aiVerification}
        remarks={remarks}
        onRemarksChange={onRemarksChange}
        onApprove={onApprove}
        onReject={onReject}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />
    </div>
  );
}
