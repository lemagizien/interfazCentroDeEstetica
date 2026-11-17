import { useState, type SubmitEvent } from "react";
import { Brand } from "../../../components/Brand";
import { Icon } from "../../../components/Icon";

export const SuperadminLoginPage = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("El acceso todavía no está conectado al servicio de autenticación.");
  };

  return (
    <main className="superadmin-login-page">
      <section className="superadmin-login-card" aria-labelledby="superadmin-title">
        <header className="superadmin-login-header">
          <Brand />
          <span className="superadmin-access-label">
            <Icon name="grid" size={16} />
            Acceso restringido
          </span>
        </header>

        <div className="superadmin-login-heading">
          <p className="superadmin-eyebrow">Administración de plataforma</p>
          <h1 id="superadmin-title">Panel de superadmin</h1>
          <p>Ingresá con tus credenciales para continuar.</p>
        </div>

        <form className="superadmin-login-form" onSubmit={handleSubmit}>
          <label htmlFor="superadmin-email">Correo electrónico</label>
          <input
            id="superadmin-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@micentro.com"
            required
          />

          <label htmlFor="superadmin-password">Contraseña</label>
          <input
            id="superadmin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Ingresá tu contraseña"
            required
          />

          <button className="primary-button superadmin-login-submit" type="submit">
            Iniciar sesión <Icon name="arrow" />
          </button>
          <p className="superadmin-login-message" role="status" aria-live="polite">
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
