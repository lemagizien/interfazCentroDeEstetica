import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthView } from "../modules/auth/AuthView";
import { ClientBookingView } from "../modules/client/ClientBookingView";
import { OwnerDashboardView } from "../modules/owner/OwnerDashboardView";

export const AppRoutes = () => {
  const [role, setRole] = useState<"client" | "owner" | null>(null);
  const navigate = useNavigate();

  const handleEnter = (selectedRole: "client" | "owner") => {
    setRole(selectedRole);
    navigate(selectedRole === "owner" ? "/owner" : "/client");
  };

  const handleLogout = () => {
    setRole(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthView enter={handleEnter} />} />
      <Route path="/singup" element={<AuthView enter={handleEnter} />} />

      <Route
        path="/client"
        element={
          role === "client" ? (
            <ClientBookingView onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/owner"
        element={
          role === "owner" ? (
            <OwnerDashboardView onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};