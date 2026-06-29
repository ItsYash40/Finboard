"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { getApiError } from "@/lib/api";
import { kycApi } from "../../../kyc/api/kyc-api";
import { useAuth } from "../../../auth/context/auth-context";
import {
  computeKycStats,
  filterKycApplications,
  getFilterCounts,
} from "../lib/kyc-admin-formatters";

export function useAdminKycList({ searchQuery = "", statusFilter = "all" } = {}) {
  const list = useQuery({
    queryKey: ["admin-kyc-list"],
    queryFn: kycApi.adminList,
  });

  const applications = list.data || [];

  const stats = useMemo(() => computeKycStats(applications), [applications]);

  const filterCounts = useMemo(() => getFilterCounts(applications), [applications]);

  const filteredApplications = useMemo(
    () => filterKycApplications(applications, { searchQuery, statusFilter }),
    [applications, searchQuery, statusFilter]
  );

  return {
    list,
    applications,
    filteredApplications,
    stats,
    filterCounts,
  };
}

export function useAdminKycDetail(applicationId, { enabled = true } = {}) {
  const { token, ready } = useAuth();

  return useQuery({
    queryKey: ["admin-kyc-detail", applicationId],
    queryFn: () => kycApi.adminGet(applicationId),
    enabled: enabled && ready && Boolean(token) && Boolean(applicationId),
    staleTime: 4 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminKycMutations(applicationId, { onSettled } = {}) {
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-kyc-list"] });
    if (applicationId) {
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-detail", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["audit-trail", "kyc", applicationId] });
    }
  }

  const approve = useMutation({
    mutationFn: (remarks) => kycApi.approve(applicationId, remarks),
    onSuccess() {
      toast.success("KYC approved");
      invalidate();
      onSettled?.();
    },
    onError(error) {
      toast.error(getApiError(error));
    },
  });

  const reject = useMutation({
    mutationFn: (remarks) => kycApi.reject(applicationId, remarks),
    onSuccess() {
      toast.success("KYC rejected");
      invalidate();
      onSettled?.();
    },
    onError(error) {
      toast.error(getApiError(error));
    },
  });

  return { approve, reject };
}
