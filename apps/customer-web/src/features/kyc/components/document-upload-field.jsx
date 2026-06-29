import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DocumentUploadField({
  id,
  label,
  hint,
  file,
  disabled,
  onChange
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors",
          disabled && "cursor-not-allowed opacity-60",
          file
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/25 hover:bg-muted/50"
        )}
      >
        {file ? (
          <>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="size-5 text-primary" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium">{file.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Tap to replace</p>
          </>
        ) : (
          <>
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <Upload className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </>
        )}
        <input
          id={id}
          type="file"
          accept="image/*,.pdf"
          disabled={disabled}
          className="sr-only"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
      </label>

      {file && !disabled ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={() => onChange(null)}
        >
          <X className="size-3.5" aria-hidden />
          Remove file
        </Button>
      ) : null}
    </div>
  );
}
