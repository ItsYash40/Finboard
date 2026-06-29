import { describe, expect, it } from "vitest";
import { isKycReviewable } from "@/features/admin/kyc/lib/kyc-admin-formatters";
import {
  formatScore,
  recommendationBadgeClass,
  recommendationLabel,
  scoreToneClass,
  statusBadgeClass,
  statusLabel,
} from "@/features/admin/kyc/components/kyc-status-badges";

describe("kyc admin status helpers", () => {
  it("maps known statuses to labels", () => {
    expect(statusLabel("pending_admin_review")).toBe("Pending Review");
    expect(statusLabel("approved")).toBe("Approved");
  });

  it("returns badge classes for approved status", () => {
    expect(statusBadgeClass("approved")).toContain("emerald");
  });

  it("allows review actions only while pending admin review", () => {
    expect(isKycReviewable("pending_admin_review")).toBe(true);
    expect(isKycReviewable("approved")).toBe(false);
    expect(isKycReviewable("rejected")).toBe(false);
  });

  it("formats AI scores", () => {
    expect(formatScore(92)).toBe("92%");
    expect(formatScore(null)).toBe("N/A");
  });

  it("maps score values to tone classes", () => {
    expect(scoreToneClass(90)).toContain("emerald");
    expect(scoreToneClass(60)).toContain("amber");
    expect(scoreToneClass(20)).toContain("rose");
  });

  it("maps AI recommendations to labels and badge classes", () => {
    expect(recommendationLabel("approve")).toBe("Recommend Approve");
    expect(recommendationBadgeClass("reject")).toContain("rose");
  });
});
