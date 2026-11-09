import { useState } from "react";
import { AdminDashboardView } from "./pages/AdminDashboardView";
import { ClientBookingView } from "./pages/ClientBookingView";
import { LoginView } from "./pages/LoginView";

type Role = "client" | "admin";

export default function App() {
  const [role, setRole] = useState<Role | null>(null);

  if (!role) return <LoginView enter={setRole} />;

  return role === "admin"
    ? <AdminDashboardView logout={() => setRole(null)} />
    : <ClientBookingView logout={() => setRole(null)} />;
}
