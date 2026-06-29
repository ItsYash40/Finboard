import { CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import { StatCard } from "@/features/layout";

export default function KycStatsGrid({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Clock}
        label="Pending review"
        value={stats.pending}
        description="Awaiting admin decision"
        tone="warning"
      />
      <StatCard
        icon={CheckCircle2}
        label="Approved"
        value={stats.approved}
        description="Verified applications"
        tone="success"
      />
      <StatCard
        icon={XCircle}
        label="Rejected"
        value={stats.rejected}
        description="Declined or failed"
        tone="danger"
      />
      <StatCard
        icon={Users}
        label="Total applications"
        value={stats.total}
        description="All submissions in queue"
      />
    </section>
  );
}
