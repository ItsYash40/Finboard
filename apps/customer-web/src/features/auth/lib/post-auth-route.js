import { getDefaultAdminRoute } from "@/features/admin/config/admin-nav.config";
import { isAdminRole } from "./roles";

export function getAuthenticatedHomeRoute(user) {
  if (isAdminRole(user?.role)) {
    return getDefaultAdminRoute(user.role);
  }

  return "/dashboard";
}
