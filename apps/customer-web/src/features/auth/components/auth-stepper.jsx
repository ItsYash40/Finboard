import { Check, Smartphone, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Your details", Icon: UserRound },
  { n: 2, label: "Verify phone", Icon: Smartphone },
];

function StepNode({ step, s }) {
  const isComplete = step > s.n;
  const isActive = step === s.n;
  const { Icon } = s;

  return (
    <div
      className="flex flex-col items-center gap-2"
      aria-current={isActive ? "step" : undefined}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          isComplete &&
            "bg-[var(--fb-primary)] text-[var(--fb-on-primary)]",
          isActive && "bg-foreground text-background",
          !isComplete && !isActive && "bg-muted text-muted-foreground"
        )}
      >
        {isComplete ? (
          <Check className="size-4" strokeWidth={2.5} aria-hidden />
        ) : (
          <Icon className="size-4" strokeWidth={2} aria-hidden />
        )}
      </span>
      <span
        className={cn(
          "whitespace-nowrap text-center text-[10px] font-semibold uppercase tracking-[0.12em]",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {s.label}
      </span>
    </div>
  );
}

export default function AuthStepper({ step }) {
  return (
    <nav aria-label="Sign-up progress" className="mb-7">
      <ol className="grid grid-cols-[1fr_minmax(2.5rem,4.5rem)_1fr] items-start">
        <li className="flex justify-center">
          <StepNode step={step} s={STEPS[0]} />
        </li>

        <li className="flex h-8 items-center px-1" aria-hidden>
          <div className="w-full border-t-2 border-dashed border-[var(--fb-ink)]/12" />
        </li>

        <li className="flex justify-center">
          <StepNode step={step} s={STEPS[1]} />
        </li>
      </ol>
    </nav>
  );
}
