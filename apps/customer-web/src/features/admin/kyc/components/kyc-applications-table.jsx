"use client";

import { History, Inbox, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveDataCell,
  ResponsiveDataList
} from "@/components/ui/responsive-data-list";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  getPriorityTag,
  maskId,
  STATUS_FILTERS,
  timeAgo,
} from "../lib/kyc-admin-formatters";
import { AiScoreBadge, StatusBadge } from "./kyc-status-badges";

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-1 h-3 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-12 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-8 w-8" />
      </TableCell>
    </TableRow>
  );
}

export default function KycApplicationsTable({
  applications,
  isLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  filterCounts,
}) {
  const router = useRouter();
  const hasFilters = Boolean(searchQuery) || statusFilter !== "all";

  return (
    <Card className="border-border/80">
      <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardDescription>Application queue</CardDescription>
          <CardTitle>All submissions</CardTitle>
        </div>
        <div className="flex w-full flex-col gap-2.5 sm:max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name, email, PAN…"
              className="h-10 rounded-xl pl-9 pr-8"
              aria-label="Search applications"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-0 sm:px-6">
        <div className="flex flex-wrap gap-1 px-4 sm:px-0">
          {STATUS_FILTERS.map((filter) => {
            const count = filterCounts[filter.id] ?? 0;
            const active = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onStatusFilterChange(filter.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter.label}
                <span className={cn("tabular-nums text-[10px]", active ? "opacity-70" : "opacity-50")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="px-4 sm:px-0">
            <ResponsiveDataList
              loading
              loadingSkeleton={{
                mobile: Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2 rounded-xl border p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                )),
                desktop: (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>PAN</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Audit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <TableRowSkeleton key={i} />
                      ))}
                    </TableBody>
                  </Table>
                )
              }}
            />
          </div>
        ) : applications.length === 0 ? (
          <Empty className="border-0 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>No applications</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try adjusting your search or filter."
                  : "Investor submissions will appear here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="px-4 sm:px-0">
            <ResponsiveDataList
              rows={applications}
              getRowKey={(item) => item._id}
              onRowClick={(item) => router.push(`/admin/kyc/${item._id}`)}
              columns={[
                { id: "applicant", label: "Applicant" },
                { id: "pan", label: "PAN", hideBelow: "sm" },
                { id: "status", label: "Status" },
                { id: "score", label: "AI Score", hideBelow: "md" },
                { id: "submitted", label: "Submitted", hideBelow: "lg" },
                { id: "audit", label: "Audit", headClassName: "text-right" }
              ]}
              renderCard={(item) => {
                const tag = getPriorityTag(item);
                const score = item.aiVerification?.overallScore;
                const age = timeAgo(item.submittedAt || item.createdAt);

                return (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{item.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.user?.email || "No email"}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-8 shrink-0"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/admin/audit/${item._id}`} aria-label={`View audit trail for ${item.name}`}>
                          <History className="size-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">PAN</p>
                        <p className="font-mono">{maskId(item.panNumber)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p>{age || "—"}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={item.status} />
                      {typeof score === "number" ? <AiScoreBadge score={score} /> : null}
                      {tag ? (
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", tag.cls)}>
                          {tag.text}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              }}
              renderRow={(item) => {
                const tag = getPriorityTag(item);
                const score = item.aiVerification?.overallScore;
                const age = timeAgo(item.submittedAt || item.createdAt);

                return (
                  <>
                    <ResponsiveDataCell>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.user?.email || "No email"}</p>
                    </ResponsiveDataCell>
                    <ResponsiveDataCell className="hidden font-mono text-sm sm:table-cell">
                      {maskId(item.panNumber)}
                    </ResponsiveDataCell>
                    <ResponsiveDataCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={item.status} />
                        {tag ? (
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", tag.cls)}>
                            {tag.text}
                          </span>
                        ) : null}
                      </div>
                    </ResponsiveDataCell>
                    <ResponsiveDataCell className="hidden md:table-cell">
                      {typeof score === "number" ? <AiScoreBadge score={score} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </ResponsiveDataCell>
                    <ResponsiveDataCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {age || "—"}
                    </ResponsiveDataCell>
                    <ResponsiveDataCell className="text-right">
                      <Button variant="ghost" size="icon-sm" className="size-8" asChild onClick={(e) => e.stopPropagation()}>
                        <Link href={`/admin/audit/${item._id}`} aria-label={`View audit trail for ${item.name}`}>
                          <History className="size-4" />
                        </Link>
                      </Button>
                    </ResponsiveDataCell>
                  </>
                );
              }}
            />
          </div>
        )}

        {!isLoading && applications.length > 0 ? (
          <p className="px-4 text-xs text-muted-foreground sm:px-0">
            {applications.length} application{applications.length !== 1 ? "s" : ""} shown
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
