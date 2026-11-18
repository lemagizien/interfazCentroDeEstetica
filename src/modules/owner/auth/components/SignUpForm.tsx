import { Icon } from "@/components/Icon"; 
import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";

interface SignUpFormProps {
  onSubmit: (data: { businessName: string; email: string; password: string }) => void;
  // onToggle: () => void;
}

export const SignUpForm = ({ onSubmit }: SignUpFormProps) => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !email.trim() || !password) return;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    onSubmit({
      businessName: businessName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-heading">
        <span className="login-icon"><Icon name="user" /></span>
        <h2>Registrarse</h2>
        <p>Registráte gratis y comenzá a recibir reservas.</p>
      </div>

      <label>
        Nombre del Negocio
        <input
          type="text"
          placeholder="Ej: MiBarberia224"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
      </label>

      <label>
        Correo Electrónico
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        <span>Contraseña</span>
        <input
          type="password"
          placeholder="Mínimo 8 caracteres."
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          minLength={8}
          required
        />
      </label>

      <label>
        Confirmar Contraseña
        <input
          type="password"
          placeholder="Repetí la contraseña."
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (error) setError(null);
          }}
          minLength={8}
          required
        />
      </label>

      {error && <p className="modal-error">{error}</p>}

      <button type="submit" className="primary-button login-submit">
        Crear cuenta <Icon name="arrow" />
      </button>

      <p className="register-prompt">
        ¿Ya tenés una cuenta?{" "}
        <Link className="change-form" to="/login">Ingresar</Link>
      </p>

      <small className="login-note">El registro público es únicamente para clientes.</small>
    </form>
  );
};