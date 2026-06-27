import { CheckCircle2, Clock, FileSearch, Users } from "lucide-react";
import { StatCard } from "@/features/layout";

export default function AuditStatsGrid({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Users}
        label="Tracked applications"
        value={stats.total}
        description="KYC records with audit history"
      />
      <StatCard
        icon={Clock}
        label="Pending review"
        value={stats.pending}
        description="Submitted, awaiting decision"
        tone="warning"
      />
      <StatCard
        icon={CheckCircle2}
        label="Approved records"
        value={stats.approved}
        description="Final approval logged"
        tone="success"
      />
      <StatCard
        icon={FileSearch}
        label="Rejected records"
        value={stats.rejected}
        description="Declined or failed submissions"
        tone="danger"
      />
    </section>
  );
}
