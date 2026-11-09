// src/modules/auth/LoginView.tsx
import { Brand } from "../../components/Brand";
import { Icon } from "../../components/Icon";
import { SignUpForm } from "./components/SingUpForm";
import { LoginForm } from "./components/LoginForm";
import { useLocation } from "react-router-dom";

// Interface para declarar de forma limpia el contrato de props
interface AuthViewProps {
  enter: (role: "client" | "owner") => void;
}

export const AuthView = ({ enter }: AuthViewProps) => {
  const location = useLocation();
  //const navigate = useNavigate();

  // Se determina la vista según la URL activa (/signup vs /login)
  const isSignUp = location.pathname === "/singup";

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
        <small className="photo-credit">Puto el que lee</small>
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
      </section>
    </main>
  );
};