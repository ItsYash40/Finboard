"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/features/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditTrail } from "../components/audit-trail";
import AuditDetailHeader from "../components/audit-detail-header";
import { useAdminAuditApplication } from "../hooks/use-admin-audit";

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-3xl" />
      <Skeleton className="h-96 w-full rounded-3xl" />
    </div>
  );
}

export default function AdminAuditDetailScreen({ applicationId }) {
  const detail = useAdminAuditApplication(applicationId);
  const selected = detail.data;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href="/admin/audit">
              <ArrowLeft className="size-4" />
              Back to audit explorer
            </Link>
          </Button>
          {applicationId ? (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={`/admin/kyc/${applicationId}`}>
                <ExternalLink className="size-4" />
                Open KYC review
              </Link>
            </Button>
          ) : null}
        </div>

        {detail.isLoading ? <DetailSkeleton /> : null}

        {detail.isError ? (
          <p className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-700 dark:text-rose-200">
            Application not found or could not be loaded.
          </p>
        ) : null}

        {!detail.isLoading && selected ? (
          <>
            <AuditDetailHeader application={selected.application} user={selected.user} />
            <AuditTrail
              resourceType="kyc"
              resourceId={applicationId}
              title="Compliance event history"
            />
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
