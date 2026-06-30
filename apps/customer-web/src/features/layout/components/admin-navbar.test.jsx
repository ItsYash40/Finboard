import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminNavbar from "./admin-navbar";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/kyc",
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock("@/features/auth/context/auth-context", () => ({
  useAuth: vi.fn()
}));

import { useAuth } from "@/features/auth/context/auth-context";

function getDesktopNav() {
  const navs = screen.getAllByRole("navigation");
  return navs.find((nav) => nav.className.includes("md:flex")) || navs[0];
}

describe("AdminNavbar", () => {
  it("shows role-filtered links for rta_admin", () => {
    useAuth.mockReturnValue({
      user: { role: "rta_admin", email: "rta.admin@finboard.local" },
      logout: vi.fn()
    });

    render(<AdminNavbar />);

    const desktopNav = getDesktopNav();

    expect(within(desktopNav).getByRole("link", { name: "KYC Review" })).toBeInTheDocument();
    expect(within(desktopNav).getByRole("link", { name: "Audit" })).toBeInTheDocument();
    expect(within(desktopNav).queryByRole("link", { name: "Banking" })).not.toBeInTheDocument();
    expect(screen.getByText("RTA Admin")).toBeInTheDocument();
  });

  it("shows all platform admin modules", () => {
    useAuth.mockReturnValue({
      user: { role: "admin", email: "admin@finboard.local" },
      logout: vi.fn()
    });

    render(<AdminNavbar />);

    const desktopNav = getDesktopNav();

    expect(within(desktopNav).getByRole("link", { name: "KYC Review" })).toBeInTheDocument();
    expect(within(desktopNav).getByRole("link", { name: "Audit" })).toBeInTheDocument();
    expect(within(desktopNav).getByRole("link", { name: "Banking" })).toBeInTheDocument();
    expect(within(desktopNav).getByRole("link", { name: "AMC" })).toBeInTheDocument();
  });

  it("uses aligned shell padding and safe-area on the sticky header", () => {
    useAuth.mockReturnValue({
      user: { role: "admin", email: "admin@finboard.local" },
      logout: vi.fn()
    });

    const { container } = render(<AdminNavbar />);
    const header = container.querySelector("header");
    const inner = header?.querySelector("div");

    expect(inner?.className).toMatch(/px-4/);
    expect(inner?.className).toMatch(/sm:px-6/);
    expect(header?.className).toMatch(/safe-area-inset-top/);
  });
});
