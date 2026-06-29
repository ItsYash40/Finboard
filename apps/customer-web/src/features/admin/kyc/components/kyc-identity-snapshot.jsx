import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function DatasetChecks({ checks }) {
  if (!checks) return null;

  const rows = [
    { label: "Identity exists", value: checks.identityExists },
    { label: "Name match", value: checks.nameMatchesDataset },
    { label: "PAN match", value: checks.panMatchesDataset },
    { label: "Aadhaar match", value: checks.aadhaarMatchesDataset },
    { label: "PAN OCR", value: checks.panOcrMatches },
    { label: "Aadhaar OCR", value: checks.aadhaarOcrMatches },
  ];

  const failed = rows.filter((r) => r.value === false);
  const passedCount = rows.filter((r) => r.value === true).length;

  if (failed.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 dark:border-emerald-400/25 dark:bg-emerald-950/40">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          All {passedCount} dataset checks passed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {failed.map((r) => (
          <Badge
            key={r.label}
            variant="outline"
            className="rounded-full border-[var(--negative)]/20 bg-[var(--negative)]/10 text-[var(--negative)]"
          >
            ✗ {r.label}
          </Badge>
        ))}
      </div>
      {passedCount > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          {passedCount} of {rows.length} checks passed
        </p>
      ) : null}
    </div>
  );
}

export default function KycIdentitySnapshot({ selected, review }) {
  const shortId = String(selected.application._id).slice(-8);

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardDescription>Identity snapshot</CardDescription>
        <CardTitle>Contact & dataset checks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DatasetChecks checks={review?.checks} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Phone", value: selected.user?.phone || "—" },
            { label: "PAN", value: review?.entered?.panNumber || "—" },
            { label: "Aadhaar", value: review?.entered?.aadhaarNumber || "—" },
            { label: "Application ID", value: `···${shortId}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
