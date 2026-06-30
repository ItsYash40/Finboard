"use client";

import { ExternalLink, History, Inbox, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/features/admin/kyc/components/kyc-status-badges";
import {
  maskId,
  STATUS_FILTERS,
  timeAgo,
} from "@/features/admin/kyc/lib/kyc-admin-formatters";
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
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-8 w-16" />
      </TableCell>
    </TableRow>
  );
}

export default function AuditApplicationsTable({
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
          <CardDescription>Audit lookup</CardDescription>
          <CardTitle>KYC application records</CardTitle>
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
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                  : "KYC submissions will appear here for audit lookup."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="px-4 sm:px-0">
            <ResponsiveDataList
              rows={applications}
              getRowKey={(item) => item._id}
              onRowClick={(item) => router.push(`/admin/audit/${item._id}`)}
              columns={[
                { id: "applicant", label: "Applicant" },
                { id: "pan", label: "PAN", hideBelow: "sm" },
                { id: "status", label: "Status" },
                { id: "submitted", label: "Submitted", hideBelow: "lg" },
                { id: "actions", label: "Actions", headClassName: "text-right" }
              ]}
              renderCard={(item) => {
                const age = timeAgo(item.submittedAt || item.createdAt);

                return (
                  <div className="space-y-3">
                    <div className="min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.user?.email || "No email"}</p>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/admin/audit/${item._id}`}>
                          <History className="mr-1.5 size-3.5" />
                          Audit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/admin/kyc/${item._id}`}>
                          <ExternalLink className="mr-1.5 size-3.5" />
                          KYC
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              }}
              renderRow={(item) => {
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
                      <StatusBadge status={item.status} />
                    </ResponsiveDataCell>
                    <ResponsiveDataCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {age || "—"}
                    </ResponsiveDataCell>
                    <ResponsiveDataCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon-sm" className="size-8" asChild>
                          <Link
                            href={`/admin/audit/${item._id}`}
                            aria-label={`View audit trail for ${item.name}`}
                          >
                            <History className="size-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="size-8" asChild>
                          <Link
                            href={`/admin/kyc/${item._id}`}
                            aria-label={`Open KYC review for ${item.name}`}
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </ResponsiveDataCell>
                  </>
                );
              }}
            />
          </div>
        )}

        {!isLoading && applications.length > 0 ? (
          <p className="px-4 text-xs text-muted-foreground sm:px-0">
            {applications.length} record{applications.length !== 1 ? "s" : ""} shown
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
