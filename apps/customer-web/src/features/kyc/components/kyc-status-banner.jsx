import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { KYC_APPLICATION_STATUS } from "../lib/kyc-status";

const toneStyles = {
  warning: {
    card: "border-amber-500/25 bg-amber-500/[0.07]",
    icon: "bg-amber-500/15 text-amber-700 dark:text-amber-300"
  },
  success: {
    card: "border-primary/30 bg-primary/[0.08]",
    icon: "bg-primary/20 text-primary"
  },
  danger: {
    card: "border-destructive/25 bg-destructive/[0.07]",
    icon: "bg-destructive/15 text-destructive"
  },
  default: {
    card: "border-border bg-muted/40",
    icon: "bg-muted text-muted-foreground"
  }
};

export default function KycStatusBanner({ status, tone, icon: StatusIcon, applicationStatus }) {
  const styles = toneStyles[tone] || toneStyles.default;
  const isApproved = applicationStatus === KYC_APPLICATION_STATUS.APPROVED;

  return (
    <Card className={cn("overflow-hidden", styles.card)}>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full",
              styles.icon
            )}
          >
            <StatusIcon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-base font-semibold leading-tight">{status.label}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{status.description}</p>
          </div>
        </div>

        {isApproved ? (
          <Button className="h-10 w-full shrink-0 gap-1.5 rounded-full px-5 sm:w-auto" asChild>
            <Link href="/banking">
              Link bank account
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
