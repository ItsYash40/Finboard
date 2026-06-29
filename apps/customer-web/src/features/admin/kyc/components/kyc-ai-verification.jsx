import { Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatScore } from "./kyc-status-badges";

export default function KycAiVerification({ aiVerification }) {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardDescription>Automated assessment</CardDescription>
        <CardTitle>AI verification</CardTitle>
      </CardHeader>
      <CardContent>
        {!aiVerification ? (
          <Alert>
            <Sparkles className="size-4" />
            <AlertDescription>No AI score available for this application.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                Confidence score
              </p>
              <p
                className={cn(
                  "text-5xl font-bold tabular-nums tracking-tight leading-none",
                  aiVerification.overallScore >= 80
                    ? "text-emerald-700 dark:text-emerald-300"
                    : aiVerification.overallScore >= 50
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-rose-700 dark:text-rose-300"
                )}
              >
                {formatScore(aiVerification.overallScore)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                via{" "}
                <span className="font-medium capitalize">
                  {aiVerification.verificationSource || "automated"}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {[
                { key: "name", label: "Name accuracy" },
                { key: "panNumber", label: "PAN accuracy" },
                { key: "aadhaarNumber", label: "Aadhaar accuracy" },
              ].map(({ key, label }) => {
                const field = aiVerification.fields?.[key] || {};
                const score = Number(field.score) || 0;
                return (
                  <div key={key}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{label}</span>
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                            score >= 80
                              ? "text-emerald-700 dark:text-emerald-300"
                              : score >= 50
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-rose-700 dark:text-rose-300"
                        )}
                      >
                        {formatScore(field.score)}
                      </span>
                    </div>
                    <Progress value={score} className="h-2 [&_[data-slot=progress-track]]:h-2" />
                    {field.notes ? (
                      <p className="mt-1 text-xs text-muted-foreground">{field.notes}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {aiVerification.alignments ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "User ↔ DB", value: aiVerification.alignments.userInputVsIdentity },
                  { label: "OCR ↔ DB", value: aiVerification.alignments.ocrVsIdentity },
                  { label: "Images ↔ DB", value: aiVerification.alignments.imagesVsIdentity },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-center"
                  >
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold tabular-nums">{formatScore(value)}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {aiVerification.summary ? (
              <p className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3 text-sm text-muted-foreground italic">
                "{aiVerification.summary}"
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
