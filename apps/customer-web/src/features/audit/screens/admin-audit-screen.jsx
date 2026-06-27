"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/features/layout";
import AuditApplicationsTable from "../components/audit-applications-table";
import AuditDashboardHero from "../components/audit-dashboard-hero";
import AuditStatsGrid from "../components/audit-stats-grid";
import { useAdminAuditApplications } from "../hooks/use-admin-audit";

export default function AdminAuditScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { list, filteredApplications, stats, filterCounts } = useAdminAuditApplications({
    searchQuery,
    statusFilter,
  });

  useEffect(() => {
    const kycId = searchParams.get("kycId");
    if (kycId) {
      router.replace(`/admin/audit/${kycId}`);
    }
  }, [router, searchParams]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AuditDashboardHero />
        <AuditStatsGrid stats={stats} />
        <AuditApplicationsTable
          applications={filteredApplications}
          isLoading={list.isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          filterCounts={filterCounts}
        />
      </div>
    </AdminShell>
  );
}
