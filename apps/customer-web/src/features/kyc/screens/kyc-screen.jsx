"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  Landmark,
  ShieldCheck,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/features/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { kycApi } from "../api/kyc-api";
import DocumentUploadField from "../components/document-upload-field";
import KycStatusBanner from "../components/kyc-status-banner";
import KycStepper from "../components/kyc-stepper";
import {
  canSubmitKyc,
  getKycCheckItems,
  getKycProgressStep,
  getKycStatusPresentation,
  maskAadhaar,
  maskPan
} from "../lib/kyc-status";

const statusStyles = {
  warning: "border-amber-500/30 bg-amber-500/8",
  success: "border-emerald-500/30 bg-emerald-500/8",
  danger: "border-destructive/30 bg-destructive/8",
  default: "border-border bg-muted/30"
};

const statusIcons = {
  warning: Clock3,
  success: CheckCircle2,
  danger: XCircle,
  default: ShieldCheck
};

const INPUT_CLS = "h-11 rounded-xl";

export default function KycPage() {
  const [form, setForm] = useState({ name: "", panNumber: "", aadhaarNumber: "", panFile: null, aadhaarFile: null });
  const current = useQuery({ queryKey: ["my-kyc"], queryFn: kycApi.me });
  const submit = useMutation({
    mutationFn: kycApi.submit,
    onSuccess() {
      toast.success("Documents submitted — we'll verify you shortly.");
      current.refetch();
      setForm({ name: "", panNumber: "", aadhaarNumber: "", panFile: null, aadhaarFile: null });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const application = current.data?.application;
  const canSubmit = current.data?.canSubmit ?? canSubmitKyc(application);
  const status = getKycStatusPresentation(application);
  const progressStep = getKycProgressStep(application);
  const checkItems = getKycCheckItems(application?.checks);
  const StatusIcon = statusIcons[status.tone] || ShieldCheck;

  function submitKyc(event) {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Your verification is already in progress or complete.");
      return;
    }

    if (!form.name.trim() || !form.panNumber.trim() || !form.aadhaarNumber.trim()) {
      toast.error("Please enter your full name, PAN, and Aadhaar number.");
      return;
    }

    if (!form.panFile || !form.aadhaarFile) {
      toast.error("Please upload photos of both your PAN and Aadhaar.");
      return;
    }

    submit.mutate(form);
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full min-w-0 max-w-5xl space-y-4 sm:space-y-6">
        {/* Hero */}
        <Card className="overflow-hidden border-border/80">
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="rounded-full text-[11px] font-semibold uppercase tracking-wide">
                Identity verification
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Verify your identity</h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Upload your PAN and Aadhaar once. We read and verify your details automatically, then a
                compliance expert gives final approval — usually within minutes.
              </p>
            </div>
            <KycStepper step={progressStep} />
          </CardContent>
        </Card>

        {/* Status banner */}
        {current.isLoading ? (
          <Skeleton className="h-20 w-full rounded-2xl" />
        ) : application ? (
          <KycStatusBanner
            status={status}
            tone={status.tone}
            icon={StatusIcon}
            applicationStatus={application.status}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
          {/* Submission form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCheck2 className="size-5 text-primary" aria-hidden />
                Your documents
              </CardTitle>
              <CardDescription>
                {canSubmit
                  ? "Use the same name as on your PAN and Aadhaar. Clear photos work best."
                  : "Your current application is being processed. You'll be able to submit again if we need updated documents."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {current.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
              ) : (
                <form className="space-y-5" onSubmit={submitKyc}>
                  <Field className="gap-1.5">
                    <FieldLabel>Full name (as on PAN / Aadhaar)</FieldLabel>
                    <Input
                      className={INPUT_CLS}
                      placeholder="Adya Sharma"
                      value={form.name}
                      disabled={!canSubmit || submit.isPending}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field className="gap-1.5">
                      <FieldLabel>PAN number</FieldLabel>
                      <Input
                        className={INPUT_CLS}
                        placeholder="ABCDE1234F"
                        value={form.panNumber}
                        disabled={!canSubmit || submit.isPending}
                        onChange={(event) => setForm({ ...form, panNumber: event.target.value.toUpperCase() })}
                      />
                    </Field>
                    <Field className="gap-1.5">
                      <FieldLabel>Aadhaar number</FieldLabel>
                      <Input
                        className={INPUT_CLS}
                        placeholder="1234 5678 9012"
                        inputMode="numeric"
                        value={form.aadhaarNumber}
                        disabled={!canSubmit || submit.isPending}
                        onChange={(event) => setForm({ ...form, aadhaarNumber: event.target.value })}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <DocumentUploadField
                      id="pan-upload"
                      label="Upload PAN card"
                      hint="PNG, JPG or PDF"
                      file={form.panFile}
                      disabled={!canSubmit || submit.isPending}
                      onChange={(panFile) => setForm({ ...form, panFile })}
                    />
                    <DocumentUploadField
                      id="aadhaar-upload"
                      label="Upload Aadhaar card"
                      hint="Front side, clearly visible"
                      file={form.aadhaarFile}
                      disabled={!canSubmit || submit.isPending}
                      onChange={(aadhaarFile) => setForm({ ...form, aadhaarFile })}
                    />
                  </div>

                  <FieldDescription>
                    Your documents are encrypted and only used for verification. We never share them with third parties.
                  </FieldDescription>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl sm:w-auto sm:px-8"
                    disabled={!canSubmit || submit.isPending}
                  >
                    {submit.isPending ? "Submitting…" : canSubmit ? "Submit for verification" : "Submission locked"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Status sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application status</CardTitle>
                <CardDescription>Track where you are in the verification journey.</CardDescription>
              </CardHeader>
              <CardContent>
                {current.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : application ? (
                  <div className="space-y-4">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-3 py-1", statusStyles[status.tone])}
                    >
                      {status.label}
                    </Badge>

                    <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-sm">
                      <dl className="grid gap-3">
                        <div>
                          <dt className="text-muted-foreground">Name</dt>
                          <dd className="font-medium">{application.name}</dd>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <dt className="text-muted-foreground">PAN</dt>
                            <dd className="font-medium font-mono">{maskPan(application.panNumber)}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Aadhaar</dt>
                            <dd className="font-medium font-mono">{maskAadhaar(application.aadhaarNumber)}</dd>
                          </div>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Submitted</dt>
                          <dd className="font-medium">
                            {new Date(application.submittedAt || application.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {checkItems.length ? (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Verification checks
                          </p>
                          <ul className="space-y-2">
                            {checkItems.map((item) => (
                              <li
                                key={item.key}
                                className="flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm"
                              >
                                <span>{item.label}</span>
                                {item.passed ? (
                                  <Badge className="gap-1 rounded-full border-0 bg-primary/15 text-[10px] text-[var(--positive-deep)]">
                                    <CheckCircle2 className="size-3" aria-hidden />
                                    Passed
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1 rounded-full text-[10px]">
                                    <XCircle className="size-3" aria-hidden />
                                    Failed
                                  </Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <ShieldCheck className="size-6 text-muted-foreground" aria-hidden />
                    </span>
                    <p className="text-sm font-medium">No application yet</p>
                    <p className="text-xs text-muted-foreground">
                      Upload your PAN and Aadhaar in the form to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    1
                  </span>
                  <p>We read your documents and match your details automatically.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    2
                  </span>
                  <p>A compliance expert reviews your application for final approval.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    3
                  </span>
                  <p>Once verified, link your bank with a ₹2 test deposit — refunded in seconds.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href="/banking">
                    <Landmark className="size-4" aria-hidden />
                    Go to banking
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
