import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdminAuditScreen from "./admin-audit-screen";

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn(), replace: mockReplace })
}));

vi.mock("@/features/auth/context/auth-context", () => ({
  useAuth: () => ({
    token: "test-token",
    ready: true,
    user: { role: "admin", email: "admin@finboard.local" }
  })
}));

vi.mock("../hooks/use-admin-audit", () => ({
  useAdminAuditApplications: vi.fn().mockReturnValue({
    list: { isLoading: false },
    filteredApplications: [
      {
        _id: "kyc-app-001",
        name: "Anurag Swarnakar",
        status: "approved",
        user: { email: "anurag@example.com" },
        panNumber: "QMRPS6975K",
        submittedAt: "2026-06-27T07:33:49.207Z"
      }
    ],
    stats: { total: 1, pending: 0, approved: 1, rejected: 0 },
    filterCounts: { all: 1, pending_admin_review: 0, approved: 1, rejected: 0 }
  })
}));

function renderWithClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("AdminAuditScreen", () => {
  beforeEach(() => {
    mockSearchParams.delete("kycId");
    mockReplace.mockClear();
  });

  it("renders audit explorer with table and stats", async () => {
    renderWithClient(<AdminAuditScreen />);

    expect(await screen.findByText("Audit Trail Explorer")).toBeInTheDocument();
    expect(screen.getAllByText("Anurag Swarnakar").length).toBeGreaterThan(0);
    expect(screen.getByText("Tracked applications")).toBeInTheDocument();
  });

  it("redirects legacy kycId query param to detail route", async () => {
    mockSearchParams.set("kycId", "kyc-app-001");

    renderWithClient(<AdminAuditScreen />);

    expect(mockReplace).toHaveBeenCalledWith("/admin/audit/kyc-app-001");
  });
});
