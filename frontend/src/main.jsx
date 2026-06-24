import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/AuthContext.jsx";
import App from "./App.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import SigninPage from "./pages/SigninPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import KycPage from "./pages/KycPage.jsx";
import AdminKycPage from "./pages/AdminKycPage.jsx";
import BankingPage from "./pages/BankingPage.jsx";
import BankingAdminPage from "./pages/BankingAdminPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import StockDetailPage from "./pages/StockDetailPage.jsx";
import "./styles.css";

const queryClient = new QueryClient();

function DashboardGate() {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <DashboardPage />;
}

function ProtectedRoute({ children, requiredRole }) {
  const { token, user, ready } = useAuth();

  if (!ready) {
    return <div className="screen-loader">Preparing your secure session...</div>;
  }

  if (!token) {
    return <Navigate to={requiredRole === "admin" ? "/admin/login" : "/signin"} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route element={<App />}>
              <Route index element={<Navigate to="/signup" replace />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/signin" element={<SigninPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardGate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stocks/:symbol"
                element={
                  <ProtectedRoute>
                    <StockDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc"
                element={
                  <ProtectedRoute>
                    <KycPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminKycPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/kyc"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminKycPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/banking"
                element={
                  <ProtectedRoute>
                    <BankingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/banking/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <BankingAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
