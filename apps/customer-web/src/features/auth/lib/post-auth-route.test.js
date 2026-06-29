import { describe, expect, it } from "vitest";
import { getAuthenticatedHomeRoute } from "./post-auth-route";

describe("getAuthenticatedHomeRoute", () => {
  it("sends platform admin to the default admin module", () => {
    expect(getAuthenticatedHomeRoute({ role: "admin" })).toBe("/admin/kyc");
  });

  it("sends rta_admin to KYC review", () => {
    expect(getAuthenticatedHomeRoute({ role: "rta_admin" })).toBe("/admin/kyc");
  });

  it("sends amc_admin to AMC", () => {
    expect(getAuthenticatedHomeRoute({ role: "amc_admin" })).toBe("/admin/amc");
  });

  it("sends investors to the customer dashboard", () => {
    expect(getAuthenticatedHomeRoute({ role: "user" })).toBe("/dashboard");
    expect(getAuthenticatedHomeRoute(null)).toBe("/dashboard");
  });
});
