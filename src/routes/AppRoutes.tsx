
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";

import { OwnerAuthPage } from "../modules/owner/auth/OwnerAuthPage";
import { ClientBookingPage } from "../modules/client/ClientBookingPage";
import { OwnerDashboardPage } from "../modules/owner/dashboard/OwnerDashboardPage";
import { SuperadminLoginPage } from "../modules/superadmin/auth/SuperadminLoginPage";
import { AgendiaHomePage } from "../modules/agendia/AgendiaHomePage";
import { AdminDashboardPage } from "../modules/superadmin/dashboard/AdminDashboardPage";

import { authService } from "../services/auth.service";

const SUPERADMIN_LOGIN_PATH = "/__platform/9e4c2b71/access";

// Componente que protege el panel del ADMIN_CENTRO.
const AdminCentroPanel = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const loginPath = slug
    ? `/centros/${encodeURIComponent(slug)}/admin/login`
    : "/";

  const sesionValida = slug
    ? authService.tieneSesionAdmin(slug)
    : false;

  const cerrarSesion = () => {
    authService.cerrarSesionAdmin();
    navigate(loginPath, { replace: true });
  };

  if (!sesionValida) {
    return <Navigate to={loginPath} replace />;
  }

  return <OwnerDashboardPage onLogout={cerrarSesion} />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Página principal de Agendia */}
      <Route path="/" element={<AgendiaHomePage />} />

      {/* Login administrativo de cada centro */}
      <Route path="/centros/:slug/admin/login" element={<OwnerAuthPage enter={() => { }} />} />

      {/* Panel del ADMIN_CENTRO */}
      <Route path="/centros/:slug/admin/*" element={<AdminCentroPanel />} />

      {/* Login privado del SUPERADMIN */}
      <Route path={SUPERADMIN_LOGIN_PATH} element={<SuperadminLoginPage />} />

      <Route path="/__platform/9e4c2b71/panel" element={
        authService.tieneSesionSuperadmin() ? (<AdminDashboardPage />
        ) : (
          <Navigate to={SUPERADMIN_LOGIN_PATH} replace />
        )
      }
      />

      {/* Rutas antiguas */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route path="/signup" element={<Navigate to="/" replace />} />

      <Route path="/owner/*" element={<Navigate to="/" replace />} />

      {/* Página pública para clientes */}
      <Route path="/:businessSlug" element={<ClientBookingPage />} />
    </Routes>
  );
};
