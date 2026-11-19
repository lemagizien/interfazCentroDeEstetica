
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const LoginForm = ({
  onSubmit,
  loading = false,
  error = "",
}: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    await onSubmit(email.trim(), password);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-heading">
        <span className="login-icon">
          <Icon name="user" />
        </span>

        <h2>Acceso administrativo</h2>
        <p>
          Ingresá con tus credenciales para administrar tu centro.
        </p>
      </div>

      <label>
        Correo electrónico
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          disabled={loading}
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          placeholder="Ingresá tu contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          disabled={loading}
        />
      </label>

      {error && (
        <p role="alert" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}

      <button
        className="primary-button login-submit"
        type="submit"
        disabled={loading}
      >
        {loading ? "Ingresando..." : "Ingresar"}
        <Icon name="arrow" />
      </button>
    </form>
  );
};
