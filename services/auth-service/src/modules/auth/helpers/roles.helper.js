export const ADMIN_ROLES = ["admin", "rta_admin", "amc_admin"];

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}
