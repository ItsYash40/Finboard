"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/features/layout";
import { Button } from "@/components/ui/button";
import { getDocument, KycReviewPanel } from "../components/kyc-review-panel";
import { useAdminKycDetail, useAdminKycMutations } from "../hooks/use-admin-kyc";

export default function AdminKycDetailScreen({ applicationId }) {
  const [remarks, setRemarks] = useState("");

  const detail = useAdminKycDetail(applicationId);
  const { approve, reject } = useAdminKycMutations(applicationId, {
    onSettled: () => setRemarks(""),
  });

  const selected = detail.data;
  const review = selected?.adminReview;
  const panDoc = getDocument(review, "pan");
  const aadhaarDoc = getDocument(review, "aadhaar");

  return (
    <AdminShell>
      <div className="space-y-6">
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link href="/admin/kyc">
            <ArrowLeft className="size-4" />
            Back to queue
          </Link>
        </Button>

        <KycReviewPanel
          selected={selected}
          review={review}
          panDoc={panDoc}
          aadhaarDoc={aadhaarDoc}
          remarks={remarks}
          onRemarksChange={setRemarks}
          onApprove={() => approve.mutate(remarks)}
          onReject={() => reject.mutate(remarks)}
          isApproving={approve.isPending}
          isRejecting={reject.isPending}
          isLoading={detail.isLoading}
          isError={detail.isError}
          emptyMessage="Application not found."
          onRefreshDocuments={() => detail.refetch()}
        />
      </div>
    </AdminShell>
  );
}
