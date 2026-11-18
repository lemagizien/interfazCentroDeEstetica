import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { OwnerAuthPage } from "../modules/owner/auth/OwnerAuthPage";
import { ClientBookingPage } from "../modules/client/ClientBookingPage";
import { OwnerDashboardPage } from "../modules/owner/dashboard/OwnerDashboardPage";
import { SuperadminLoginPage } from "../modules/superadmin/auth/SuperadminLoginPage";

const SUPERADMIN_LOGIN_PATH = "/__platform/9e4c2b71/access";

export const AppRoutes = () => {
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleOwnerEnter = () => {
    setIsOwnerAuthenticated(true);
    navigate("/owner");
  };

  const handleOwnerLogout = () => {
    setIsOwnerAuthenticated(false);
    navigate("/login");
  };

  return (
    <Routes>
      {/* 1. Rutas exclusivas de Owners */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<OwnerAuthPage enter={handleOwnerEnter} />} />
      <Route path="/signup" element={<OwnerAuthPage enter={handleOwnerEnter} />} />
      <Route path={SUPERADMIN_LOGIN_PATH} element={<SuperadminLoginPage />} />

      <Route
        path="/owner/*"
        element={
          isOwnerAuthenticated ? (
            <OwnerDashboardPage onLogout={handleOwnerLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 2. Ruta pública dinámica para cada negocio y sus clientes */}
      <Route path="/:businessSlug" element={<ClientBookingPage />} />
    </Routes>
  );
};