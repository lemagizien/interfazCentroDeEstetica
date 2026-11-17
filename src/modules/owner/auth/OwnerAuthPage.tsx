// src/modules/auth/LoginView.tsx
import { Brand } from "../../../components/Brand";
import { Icon } from "../../../components/Icon";
import { SignUpForm } from "./components/SignUpForm";
import { LoginForm } from "./components/LoginForm";
import { useLocation } from "react-router-dom";

// Interface para declarar de forma limpia el contrato de props
interface OwnerAuthPageProps {
  enter: (role: "client" | "owner") => void;
}

export const OwnerAuthPage = ({ enter }: OwnerAuthPageProps) => {
  const location = useLocation();

  // Se determina la vista según la URL activa (/signup vs /login)
  const isSignUp = location.pathname === "/signup";

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand"><Brand /></div>
        <div className="login-quote">
          {/* <span className="eyebrow"> BIENESTAR A TU MANERA</span> */}
          <h1>La app que administra tu negocio de manera inteligente.<em></em></h1>
          <p>Gestioná tus servicios, turnos y profesionales desde un mismo lugar.</p>
          <ul>
            <li>Reservas online 24/7</li>
            <li>Recordatorios automáticos</li>
            <li>Agenda diaria</li>
            <li>Panel intuitivo</li>
          </ul>
        </div>
        {/* <small className="photo-credit"> © 2025 Alma Estética </small> */}
      </section>

      <section className="login-form-wrap">
        <span className="mobile-brand"><Brand /></span>

        {isSignUp ? (
          <SignUpForm
            onSubmit={() => enter("client")}
          />
          
        ) : (
          <>
            <LoginForm
              onSubmit={() => enter("client")}
            />
            <button className="admin-demo" onClick={() => enter("owner")}>
              <Icon name="grid" /> Ingresar como administrador
            </button>
          </>
        )}
        <small className="login-copyrigth">© 2026 MiCentro. Todos los derechos reservados.</small>
      </section>
    </main>
  );
};