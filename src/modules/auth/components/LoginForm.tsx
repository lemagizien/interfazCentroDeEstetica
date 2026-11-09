import { Icon } from "@/components/Icon";
import { Link } from "react-router-dom";

interface LoginFormProps {
  onSubmit: () => void;
  //onToggle: () => void;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  return (
    <div className="login-form">
      <div className="login-heading">
        <span className="login-icon"><Icon name="user" /></span>
        <h2>Ingresar</h2>
        <p>¡Hola de nuevo! Ingresá a tu panel para gestionar tu centro.</p>
      </div>

      <label>
        Correo Electrónico
        <input type="email" placeholder="tu@email.com" />
      </label>

      <label>
        <span>Contraseña</span>
        <input type="password" placeholder="Mínimo 8 caracteres." />
        <p><button type="button">¿Olvidaste tu contraseña?</button></p>
      </label>

      <button className="primary-button login-submit" onClick={onSubmit}>
        Ingresar <Icon name="arrow" />
      </button>

      <p className="register-prompt">
        ¿Todavía no tenés cuenta?{" "}
        <Link className="change-form" to="/singup">Registrarse gratis</Link>
      </p>
    </div>
  );
};