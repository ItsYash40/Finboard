"use client";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const HIDE_CLASS = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell"
};

export function ResponsiveDataList({
  columns = [],
  rows = [],
  getRowKey,
  renderCard,
  renderRow,
  onRowClick,
  emptyState = null,
  loading = false,
  loadingSkeleton,
  className,
  mobileClassName,
  desktopClassName
}) {
  if (loading) {
    return (
      <div className={className}>
        {loadingSkeleton ? (
          <>
            <div className={cn("space-y-3 md:hidden", mobileClassName)}>{loadingSkeleton.mobile}</div>
            <div className={cn("hidden md:block", desktopClassName)}>{loadingSkeleton.desktop}</div>
          </>
        ) : null}
      </div>
    );
  }

  if (!rows.length) {
    return emptyState;
  }

  return (
    <div className={className}>
      <div className={cn("space-y-3 md:hidden", mobileClassName)}>
        {rows.map((row, index) => {
          const key = getRowKey?.(row, index) ?? index;
          const clickable = Boolean(onRowClick);

          return (
            <div
              key={key}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => onRowClick(row) : undefined}
              onKeyDown={
                clickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              className={cn(
                "rounded-xl border border-border/80 bg-card p-4 shadow-sm",
                clickable && "cursor-pointer transition-colors hover:bg-muted/40"
              )}
            >
              {renderCard(row, index)}
            </div>
          );
        })}
      </div>

      <div className={cn("hidden overflow-x-auto md:block", desktopClassName)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(column.hideBelow ? HIDE_CLASS[column.hideBelow] : null, column.headClassName)}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => {
              const key = getRowKey?.(row, index) ?? index;
              const clickable = Boolean(onRowClick);

              return (
                <TableRow
                  key={key}
                  className={cn(clickable && "cursor-pointer hover:bg-muted/40")}
                  onClick={clickable ? () => onRowClick(row) : undefined}
                >
                  {renderRow(row, index)}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ResponsiveDataCell({ className, wrap = false, ...props }) {
  return (
    <TableCell
      className={cn(wrap ? "whitespace-normal" : null, className)}
      {...props}
    />
  );
}
