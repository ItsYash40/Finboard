"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  FileImage,
  ScanLine
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

const DOC_META = {
  pan: {
    title: "PAN card",
    subtitle: "Tax identity document",
    accent: "from-emerald-500/15 to-transparent"
  },
  aadhaar: {
    title: "Aadhaar card",
    subtitle: "Government photo ID",
    accent: "from-sky-500/15 to-transparent"
  }
};

function processingBadge(document) {
  if (document.match) {
    return { label: "Details matched", className: "border-primary/25 bg-primary/10 text-[var(--positive-deep)]" };
  }
  if (document.extractionSource === "tesseract_regex") {
    return { label: "Read automatically", className: "border-border bg-muted text-muted-foreground" };
  }
  return { label: "Stored securely", className: "border-border bg-muted text-muted-foreground" };
}

function isImageUrl(url) {
  return url && /\.(png|jpe?g|webp|gif)$/i.test(url);
}

export default function DocumentVaultCard({ document, documentUrl }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const meta = DOC_META[document.type] || {
    title: document.type?.toUpperCase() || "Document",
    subtitle: "Uploaded file",
    accent: "from-muted to-transparent"
  };
  const badge = processingBadge(document);
  const url = documentUrl(document.url);
  const hasImage = isImageUrl(document.url);

  return (
    <>
      <Card className="group overflow-hidden border-border/80 transition-all duration-300 hover:border-primary/25 hover:shadow-md">
        <CardHeader className={cn("border-b border-border/60 bg-gradient-to-br px-4 pb-4 sm:px-6", meta.accent)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {meta.subtitle}
              </p>
              <h3 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">{meta.title}</h3>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "w-fit shrink-0 gap-1 rounded-full text-[10px] font-medium",
                badge.className
              )}
            >
              {document.match ? <CheckCircle2 className="size-3" aria-hidden /> : <ScanLine className="size-3" aria-hidden />}
              {badge.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <button
            type="button"
            className="w-full touch-manipulation overflow-hidden rounded-xl border border-border/70 bg-muted/30 text-left transition-colors hover:border-primary/30 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] disabled:cursor-default disabled:active:scale-100"
            onClick={() => hasImage && setPreviewOpen(true)}
            disabled={!hasImage}
            aria-label={hasImage ? `Preview ${meta.title}` : undefined}
          >
            <AspectRatio ratio={4 / 3} className="flex items-center justify-center">
              {hasImage ? (
                <img
                  src={url}
                  alt={`${meta.title} preview`}
                  className="size-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <FileImage className="size-6 text-muted-foreground" aria-hidden />
                  </span>
                  <p className="text-sm font-medium text-foreground">Preview not available</p>
                  <p className="text-xs text-muted-foreground">Tap below to open your uploaded file.</p>
                </div>
              )}
            </AspectRatio>
          </button>

          {document.originalName ? (
            <p className="mt-3 truncate text-xs text-muted-foreground">{document.originalName}</p>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 border-t border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:px-5">
          <Button className="h-11 w-full gap-1.5 rounded-full sm:flex-1" asChild>
            <a href={url} target="_blank" rel="noreferrer">
              View document
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </Button>
          {hasImage ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto sm:min-w-[7.5rem]"
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[min(92dvh,900px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:w-full">
          <DialogHeader className="border-b border-border px-4 py-4 text-left sm:px-6">
            <DialogTitle>{meta.title}</DialogTitle>
            <DialogDescription>Uploaded during your identity verification.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-3 sm:p-4">
            <img
              src={url}
              alt={meta.title}
              className="mx-auto max-h-[min(60dvh,640px)] w-full rounded-xl object-contain"
            />
          </div>
          <div className="flex justify-stretch border-t border-border px-4 py-3 sm:justify-end sm:px-6 sm:py-4">
            <Button className="h-11 w-full gap-1.5 rounded-full sm:w-auto" asChild>
              <a href={url} target="_blank" rel="noreferrer">
                Open full size
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
