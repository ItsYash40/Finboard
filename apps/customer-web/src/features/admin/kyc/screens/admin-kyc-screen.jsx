"use client";

import { useState } from "react";
import { AdminShell } from "@/features/layout";
import KycApplicationsTable from "../components/kyc-applications-table";
import KycDashboardHero from "../components/kyc-dashboard-hero";
import KycStatsGrid from "../components/kyc-stats-grid";
import { useAdminKycList } from "../hooks/use-admin-kyc";

export default function AdminKycPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { list, filteredApplications, stats, filterCounts } = useAdminKycList({
    searchQuery,
    statusFilter,
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <KycDashboardHero />
        <KycStatsGrid stats={stats} />
        <KycApplicationsTable
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
