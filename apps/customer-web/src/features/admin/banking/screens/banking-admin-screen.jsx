"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell, AdminSection } from "@/features/layout";
import { StatCard } from "@/features/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveDataCell,
  ResponsiveDataList
} from "@/components/ui/responsive-data-list";
import { bankingApi } from "../../../banking/api/banking-api";
import { getApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

function rupee(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BankingAdminPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["bank-admin-users"], queryFn: bankingApi.adminUsers });
  const transactions = useQuery({ queryKey: ["bank-admin-transactions"], queryFn: bankingApi.adminTransactions });

  const freeze = useMutation({
    mutationFn: ({ id, frozen }) => bankingApi.freeze(id, frozen),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["bank-admin-users"] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const totalMoney = (users.data || []).reduce((sum, account) => sum + Number(account.balance), 0);
  const frozenCount = (users.data || []).filter((account) => account.status === "FROZEN").length;

  return (
    <AdminShell title="Accounts, balances and controls" description="Admin Core Banking View">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total bank money" value={rupee(totalMoney)} description="Across seeded accounts" />
          <StatCard label="Accounts" value={users.data?.length || 0} description="Admin and customers" />
          <StatCard label="Transactions" value={transactions.data?.length || 0} description="Latest 200 records" />
          <StatCard label="Frozen" value={frozenCount} description="Blocked accounts" tone="danger" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <AdminSection title="All Accounts">
            <ResponsiveDataList
              rows={users.data || []}
              getRowKey={(account) => account.id}
              columns={[
                { id: "name", label: "Name" },
                { id: "account", label: "Account" },
                { id: "ifsc", label: "IFSC", hideBelow: "sm" },
                { id: "balance", label: "Balance" },
                { id: "status", label: "Status" },
                { id: "action", label: "Action", headClassName: "text-right" }
              ]}
              renderCard={(account) => (
                <div className="space-y-3">
                  <div className="min-w-0">
                    <p className="font-medium">{account.holderName}</p>
                    <p className="break-all text-xs text-muted-foreground">{account.accountNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">IFSC</p>
                      <p className="font-mono">{account.ifsc}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Balance</p>
                      <p className="font-semibold">{rupee(account.balance)}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      account.status === "FROZEN" &&
                        "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    )}
                  >
                    {account.status}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    variant={account.status === "FROZEN" ? "default" : "outline"}
                    onClick={() => freeze.mutate({ id: account.id, frozen: account.status !== "FROZEN" })}
                  >
                    {account.status === "FROZEN" ? "Unfreeze" : "Freeze"}
                  </Button>
                </div>
              )}
              renderRow={(account) => (
                <>
                  <ResponsiveDataCell className="font-medium">{account.holderName}</ResponsiveDataCell>
                  <ResponsiveDataCell>{account.accountNumber}</ResponsiveDataCell>
                  <ResponsiveDataCell className="hidden sm:table-cell">{account.ifsc}</ResponsiveDataCell>
                  <ResponsiveDataCell className="font-semibold">{rupee(account.balance)}</ResponsiveDataCell>
                  <ResponsiveDataCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        account.status === "FROZEN" &&
                          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      )}
                    >
                      {account.status}
                    </Badge>
                  </ResponsiveDataCell>
                  <ResponsiveDataCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant={account.status === "FROZEN" ? "default" : "outline"}
                      onClick={() => freeze.mutate({ id: account.id, frozen: account.status !== "FROZEN" })}
                    >
                      {account.status === "FROZEN" ? "Unfreeze" : "Freeze"}
                    </Button>
                  </ResponsiveDataCell>
                </>
              )}
            />
            </AdminSection>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
