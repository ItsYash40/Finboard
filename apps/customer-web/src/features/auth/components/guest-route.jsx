"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthenticatedHomeRoute } from "../lib/post-auth-route";
import { isAdminRole, isCustomerRole } from "../lib/roles";
import { useAuth } from "../context/auth-context";

export default function GuestRoute({ children }) {
  const { token, user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = Boolean(token && user);
  const isAdminLogin = pathname === "/admin/login";
  const isCustomerAuth = pathname === "/signin" || pathname === "/signup";

  useEffect(() => {
    if (!ready || !isAuthenticated) {
      return;
    }

    if (isAdminLogin && isCustomerRole(user.role)) {
      router.replace("/dashboard");
      return;
    }

    if (isCustomerAuth && isAdminRole(user.role)) {
      router.replace(getAuthenticatedHomeRoute(user));
      return;
    }

    router.replace(getAuthenticatedHomeRoute(user));
  }, [ready, isAuthenticated, user, router, isAdminLogin, isCustomerAuth]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
        <Skeleton className="h-8 w-64" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
