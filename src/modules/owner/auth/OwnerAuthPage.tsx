
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Brand } from "../../../components/Brand";
import { SignUpForm } from "./components/SignUpForm";
import { LoginForm } from "./components/LoginForm";
import { authService } from "../../../services/auth.service";

interface OwnerAuthPageProps {
  enter: (role: "client" | "owner") => void;
}



export const OwnerAuthPage = ({ enter }: OwnerAuthPageProps) => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignUp = location.pathname === "/signup";


  const handleLogin = async (email: string, password: string) => {
    if (!slug) {
      setError("Seleccioná tu centro desde la página principal.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Autenticar utilizando nuestro service.
      const resultado = await authService.loginAdminCentro(slug, {
        email,
        password,
      });

      // Verificar que la cuenta sea de un ADMIN_CENTRO.
      if (resultado.usuario?.rol !== "ADMIN_CENTRO") {
        throw new Error(
          "Esta cuenta no tiene permisos de administrador."
        );
      }

      if (!resultado.token) {
        throw new Error(
          "El servidor no devolvió un token de autenticación."
        );
      }

      // Guardar la sesión mediante el service.
      authService.guardarSesionAdmin(resultado.token, slug);

      // Redirigir al panel del centro.
      navigate(`/centros/${encodeURIComponent(slug)}/admin`, {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <Brand />
        </div>

        <div className="login-quote">
          <h1>
            La app que administra tu negocio de manera inteligente.
          </h1>

          <p>
            Gestioná tus servicios, turnos y profesionales
            desde un mismo lugar.
          </p>

          <ul>
            <li>Reservas online 24/7</li>
            <li>Recordatorios automáticos</li>
            <li>Agenda diaria</li>
            <li>Panel intuitivo</li>
          </ul>
        </div>
      </section>

      <section className="login-form-wrap">
        <span className="mobile-brand">
          <Brand />
        </span>

        {isSignUp ? (
          <SignUpForm onSubmit={() => enter("client")} />
        ) : (
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
        )}

        <small className="login-copyrigth">
          © 2026 Agendia. Todos los derechos reservados.
        </small>
      </section>
    </main>
  );
};
