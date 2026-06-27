import { ProtectedRoute } from "@/features/auth";
import { BankingAdminScreen } from "@/features/admin";

export default function BankingAdminPage() {
  return (
    <ProtectedRoute requiredRole={["admin"]}>
      <BankingAdminScreen />
    </ProtectedRoute>
  );
}
