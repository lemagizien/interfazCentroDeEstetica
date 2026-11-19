
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Brand } from "../../../components/Brand";
import { Icon } from "../../../components/Icon";
import { authService } from "../../../services/auth.service";

const SUPERADMIN_PANEL_PATH = "/__platform/9e4c2b71/panel";

export const SuperadminLoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      // Autenticar al SUPERADMIN mediante el service.
      console.log("SUPERADMIN: antes de llamar al backend");

      const resultado = await authService.loginSuperadmin({
        email: email.trim(),
        password,
      });

      console.log("SUPERADMIN: el backend respondió correctamente", {
        tieneToken: Boolean(resultado.token),
        rol: resultado.usuario?.rol,
      });

      // Comprobar que el usuario tenga el rol correcto.
      if (resultado.usuario?.rol !== "SUPERADMIN") {
        throw new Error(
          "Esta cuenta no tiene permisos de SUPERADMIN."
        );
      }

      if (!resultado.token) {
        throw new Error(
          "El servidor no devolvió un token de autenticación."
        );
      }

      // Guardar la sesión del SUPERADMIN.
      authService.guardarSesionSuperadmin(resultado.token);

      window.location.replace(SUPERADMIN_PANEL_PATH);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="superadmin-login-page">
      <section
        className="superadmin-login-card"
        aria-labelledby="superadmin-title"
      >
        <header className="superadmin-login-header">
          <Brand />

          <span className="superadmin-access-label">
            <Icon name="grid" size={16} />
            Acceso restringido
          </span>
        </header>

        <div className="superadmin-login-heading">
          <p className="superadmin-eyebrow">
            Administración de plataforma
          </p>

          <h1 id="superadmin-title">
            Panel de superadmin
          </h1>

          <p>
            Ingresá con tus credenciales para continuar.
          </p>
        </div>

        <form
          className="superadmin-login-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="superadmin-email">
            Correo electrónico
          </label>

          <input
            id="superadmin-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@micentro.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
          />

          <label htmlFor="superadmin-password">
            Contraseña
          </label>

          <input
            id="superadmin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Ingresá tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={loading}
          />

          <button
            className="primary-button superadmin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
            <Icon name="arrow" />
          </button>

          <p
            className="superadmin-login-message"
            role={message ? "alert" : "status"}
            aria-live="polite"
          >
            {message}
          </p>
        </form>

        <p className="superadmin-login-footer">
          Este acceso es exclusivo para la administración general.
        </p>
      </section>
    </main>
  );
};
