"use client";

import { ExternalLink, FileText, ScanLine, X } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const apiBase = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
  : "";

function documentUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${apiBase}${path}`;
}

function SectionLabel({ children, className }) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}

function DocumentCard({ document, label, onExpand, onLoadError }) {
  if (!document) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 text-sm text-muted-foreground">
        {label} not uploaded
      </div>
    );
  }

  const src = documentUrl(document.url);
  const isImage = /\.(png|jpe?g|webp)$/i.test(document.url || "");
  const extracted = Object.entries(document.extracted || {}).filter(([, v]) => Boolean(v));

  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <SectionLabel>{label}</SectionLabel>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground" asChild>
          <a href={src} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3" />
            Open
          </a>
        </Button>
      </div>

      {isImage ? (
        <button
          type="button"
          className="group relative block w-full cursor-zoom-in"
          onClick={() => onExpand(src)}
          aria-label={`Expand ${label} document`}
        >
          <img
            src={src}
            alt={`${label} document`}
            className="h-64 w-full object-contain bg-muted/20"
            onError={onLoadError}
          />
          <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/30 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
              Click to expand
            </span>
          </div>
        </button>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-3 bg-muted/20 text-muted-foreground">
          <FileText className="size-8 opacity-30" />
          <p className="text-sm">PDF document</p>
        </div>
      )}

      {extracted.length > 0 ? (
        <div className="border-t border-border/40 px-4 py-3">
          <SectionLabel className="mb-2">Extracted fields</SectionLabel>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {extracted.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <p className="text-[10px] text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="truncate text-sm font-medium">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {document.ocrText || document.ocrPreview ? (
        <Accordion>
          <AccordionItem value="ocr" className="border-t border-border/40 border-b-0">
            <AccordionTrigger className="px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:no-underline [&>svg]:size-3.5">
              <span className="flex items-center gap-2">
                <ScanLine className="size-3.5" aria-hidden />
                Raw OCR output
                <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                  {document.extractionSource || "extracted"}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <ScrollArea className="h-32 rounded-lg border border-border/40 bg-muted/20">
                <pre className="p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {document.ocrText || document.ocrPreview}
                </pre>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  );
}

export default function KycDocumentCards({ panDoc, aadhaarDoc, onRefreshDocuments }) {
  const [expandSrc, setExpandSrc] = useState(null);

  function handleLoadError() {
    onRefreshDocuments?.();
  }

  return (
    <>
      {expandSrc ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setExpandSrc(null)}
        >
          <img
            src={expandSrc}
            alt="Document preview"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Close preview"
            className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            onClick={() => setExpandSrc(null)}
          >
            <X className="size-5" />
          </button>
        </div>
      ) : null}

      <Card className="border-border/80">
        <CardHeader>
          <CardDescription>Uploaded identity documents</CardDescription>
          <CardTitle>Documents & OCR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <DocumentCard
              document={panDoc}
              label="PAN Card"
              onExpand={setExpandSrc}
              onLoadError={handleLoadError}
            />
            <DocumentCard
              document={aadhaarDoc}
              label="Aadhaar Card"
              onExpand={setExpandSrc}
              onLoadError={handleLoadError}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
