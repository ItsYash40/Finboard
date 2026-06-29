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
          <div className="overflow-x-auto px-4 sm:px-0">
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
          <div className="overflow-x-auto px-4 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="hidden sm:table-cell">PAN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((item) => {
                  const age = timeAgo(item.submittedAt || item.createdAt);

                  return (
                    <TableRow
                      key={item._id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => router.push(`/admin/audit/${item._id}`)}
                    >
                      <TableCell>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.user?.email || "No email"}</p>
                      </TableCell>
                      <TableCell className="hidden font-mono text-sm sm:table-cell">
                        {maskId(item.panNumber)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {age || "—"}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
