import { Check, FileUp, ShieldCheck, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Upload documents", Icon: FileUp },
  { n: 2, label: "We verify you", Icon: ShieldCheck },
  { n: 3, label: "Start investing", Icon: UserCheck }
];

function StepNode({ step, s, layout }) {
  const isComplete = step > s.n;
  const isActive = step === s.n;
  const { Icon } = s;

  return (
    <div
      className={cn(
        "flex gap-2",
        layout === "vertical" ? "flex-row items-center" : "flex-col items-center"
      )}
      aria-current={isActive ? "step" : undefined}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          isComplete && "bg-primary text-primary-foreground",
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
          "font-semibold uppercase leading-tight tracking-[0.1em] text-[10px]",
          layout === "vertical" ? "text-left" : "max-w-[88px] text-center",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {s.label}
      </span>
    </div>
  );
}

export default function KycStepper({ step }) {
  return (
    <nav aria-label="KYC progress">
      {/* Horizontal scroll on narrow screens */}
      <ol className="flex min-w-0 items-start gap-2 overflow-x-auto pb-1 sm:hidden">
        {STEPS.map((s, index) => (
          <li key={s.n} className="flex shrink-0 items-center gap-2">
            <StepNode step={step} s={s} layout="horizontal" />
            {index < STEPS.length - 1 ? (
              <div className="h-px w-6 shrink-0 border-t-2 border-dashed border-border" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>

      {/* Grid layout on sm+ */}
      <ol className="hidden grid-cols-[1fr_minmax(1.5rem,2.5rem)_1fr_minmax(1.5rem,2.5rem)_1fr] items-start sm:grid">
        <li className="flex justify-center">
          <StepNode step={step} s={STEPS[0]} layout="horizontal" />
        </li>
        <li className="flex h-8 items-center px-0.5" aria-hidden>
          <div className="w-full border-t-2 border-dashed border-border" />
        </li>
        <li className="flex justify-center">
          <StepNode step={step} s={STEPS[1]} layout="horizontal" />
        </li>
        <li className="flex h-8 items-center px-0.5" aria-hidden>
          <div className="w-full border-t-2 border-dashed border-border" />
        </li>
        <li className="flex justify-center">
          <StepNode step={step} s={STEPS[2]} layout="horizontal" />
        </li>
      </ol>
    </nav>
  );
}
