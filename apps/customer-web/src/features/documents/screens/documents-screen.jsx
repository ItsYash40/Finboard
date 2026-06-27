"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  FileCheck2,
  FolderLock,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/features/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import KycStatusBanner from "../../kyc/components/kyc-status-banner";
import {
  getKycStatusPresentation,
  maskAadhaar,
  maskPan
} from "../../kyc/lib/kyc-status";
import { documentsApi } from "../api/documents-api";
import DocumentVaultCard from "../components/document-vault-card";

const apiBase = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
  : "";

function documentUrl(path) {
  if (!path) return "#";
  if (path.startsWith("http")) return path;
  return `${apiBase}${path}`;
}

const statusIcons = {
  warning: FileCheck2,
  success: ShieldCheck,
  danger: FileCheck2,
  default: FolderLock
};

export default function DocumentsScreen() {
  const applicationQuery = useQuery({
    queryKey: ["documents-kyc"],
    queryFn: documentsApi.kycApplication
  });

  const application = applicationQuery.data;
  const docs = application?.documents || [];
  const status = getKycStatusPresentation(application);
  const StatusIcon = statusIcons[status.tone] || FolderLock;

  return (
    <AppLayout>
      <div className="mx-auto w-full min-w-0 max-w-5xl space-y-4 sm:space-y-6">
        {/* Hero */}
        <Card className="overflow-hidden border-border/80">
          <CardContent className="space-y-2 px-4 pt-5 sm:px-6 sm:pt-6">
            <Badge variant="secondary" className="rounded-full text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]">
              Secure document locker
            </Badge>
            <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Your identity documents</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              PAN and Aadhaar you submitted during verification — stored securely and available whenever you need them.
            </p>
          </CardContent>
        </Card>

        {applicationQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl sm:h-24" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-72 rounded-2xl sm:h-80" />
              <Skeleton className="h-72 rounded-2xl sm:h-80" />
            </div>
          </div>
        ) : !application ? (
          <Card className="border-dashed border-border/80 bg-muted/20">
            <CardContent className="flex flex-col items-center gap-4 px-4 py-10 text-center sm:px-6 sm:py-14">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                <FolderLock className="size-7 text-primary" aria-hidden />
              </span>
              <div className="max-w-md space-y-2">
                <h2 className="text-lg font-semibold">No documents yet</h2>
                <p className="text-sm text-muted-foreground">
                  Complete identity verification to upload your PAN and Aadhaar. They&apos;ll appear here once submitted.
                </p>
              </div>
              <Button className="mt-2 h-11 w-full max-w-xs gap-2 rounded-full sm:w-auto" asChild>
                <Link href="/kyc">
                  Start verification
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <KycStatusBanner
              status={status}
              tone={status.tone}
              icon={StatusIcon}
              applicationStatus={application.status}
            />

            <Card className="border-border/80">
              <CardContent className="grid grid-cols-1 gap-4 px-4 pt-5 sm:grid-cols-3 sm:px-6 sm:pt-6">
                <div className="border-b border-border/60 pb-4 sm:border-0 sm:pb-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted</p>
                  <p className="mt-1 text-sm font-semibold leading-snug">
                    {new Date(application.submittedAt || application.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
                <div className="border-b border-border/60 pb-4 sm:border-0 sm:pb-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PAN</p>
                  <p className="mt-1 font-mono text-sm font-semibold">{maskPan(application.panNumber)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Aadhaar</p>
                  <p className="mt-1 font-mono text-sm font-semibold">{maskAadhaar(application.aadhaarNumber)}</p>
                </div>
              </CardContent>
            </Card>

            {docs.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {docs.map((document) => (
                  <DocumentVaultCard
                    key={document.type}
                    document={document}
                    documentUrl={documentUrl}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Your application exists but no files were attached. Try resubmitting from the KYC page.
                </CardContent>
              </Card>
            )}

            <Card className="border-border/80 bg-muted/20">
              <CardContent className="flex flex-col items-stretch justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6">
                <div className="min-w-0">
                  <p className="font-medium">Need to update your documents?</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    If something changed or was rejected, you can upload fresh copies from verification.
                  </p>
                </div>
                <Button variant="outline" className="h-11 w-full shrink-0 gap-1.5 rounded-full sm:w-auto" asChild>
                  <Link href="/kyc">
                    Go to verification
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <Separator />

        <p className="px-1 text-center text-xs leading-relaxed text-muted-foreground">
          Documents are encrypted in transit and at rest. Only authorised reviewers can access your files.
        </p>
      </div>
    </AppLayout>
  );
}
