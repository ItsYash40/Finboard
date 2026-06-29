import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { normalize } from "../lib/kyc-admin-formatters";
import { CompareResultBadge } from "./kyc-status-badges";

function VerificationFieldBlock({ label, entered, seeded, ocr }) {
  const baseMatched = normalize(entered) && normalize(entered) === normalize(seeded);
  const ocrPresent = Boolean(normalize(ocr));
  const ocrMatched = !ocrPresent || normalize(entered) === normalize(ocr);
  const ok = baseMatched && ocrMatched;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        ok ? "border-border/40 bg-muted/10" : "border-[var(--negative)]/20 bg-[var(--negative)]/5"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <CompareResultBadge ok={ok} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "User entered", value: entered },
          { label: "Database", value: seeded },
          { label: "OCR extracted", value: ocr },
        ].map(({ label: fieldLabel, value }) => (
          <div key={fieldLabel}>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              {fieldLabel}
            </p>
            <p className={cn("text-sm font-medium break-all", !value && "text-muted-foreground/40")}>
              {value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KycVerificationMatrix({ review, panDoc, aadhaarDoc }) {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardDescription>Cross-source comparison</CardDescription>
        <CardTitle>Verification matrix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <VerificationFieldBlock
          label="Name"
          entered={review?.entered?.name}
          seeded={review?.seeded?.name}
          ocr={panDoc?.extracted?.name || aadhaarDoc?.extracted?.name}
        />
        <VerificationFieldBlock
          label="PAN"
          entered={review?.entered?.panNumber}
          seeded={review?.seeded?.panNumber}
          ocr={panDoc?.extracted?.panNumber}
        />
        <VerificationFieldBlock
          label="Aadhaar"
          entered={review?.entered?.aadhaarNumber}
          seeded={review?.seeded?.aadhaarNumber}
          ocr={aadhaarDoc?.extracted?.aadhaarNumber}
        />
      </CardContent>
    </Card>
  );
}
