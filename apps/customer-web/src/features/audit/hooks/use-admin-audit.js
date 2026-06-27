"use client";

import { useAdminKycDetail, useAdminKycList } from "@/features/admin/kyc/hooks/use-admin-kyc";

export function useAdminAuditApplications(options) {
  return useAdminKycList(options);
}

export function useAdminAuditApplication(applicationId, options) {
  return useAdminKycDetail(applicationId, options);
}
