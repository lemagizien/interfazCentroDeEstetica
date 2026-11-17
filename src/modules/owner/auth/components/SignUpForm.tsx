import { Icon } from "@/components/Icon"; 
import { Link } from "react-router-dom";

interface SignUpFormProps {
  onSubmit: () => void;
  // onToggle: () => void;
}

export const SignUpForm = ({ onSubmit }: SignUpFormProps) => {
  return (
    <div className="login-form">
      <div className="login-heading">
        <span className="login-icon"><Icon name="user" /></span>
        <h2>Registrarse</h2>
        <p>Registráte gratis y comenzá a recibir reservas.</p>
      </div>

      <label>
        Nombre del Negocio
        <input type="text" placeholder="Ej: MiBarberia224" />
      </label>

      <label>
        Correo Electrónico
        <input type="email" placeholder="tu@email.com" />
      </label>

      <label>
        <span>Contraseña</span>
        <input type="password" placeholder="Mínimo 8 caracteres." />
      </label>

      <label>
        Confirmar Contraseña
        <input type="password" placeholder="Repetí la contraseña." />
      </label>

      <button className="primary-button login-submit" onClick={onSubmit}>
        Crear cuenta <Icon name="arrow" />
      </button>

      <p className="register-prompt">
        ¿Ya tenés una cuenta?{" "}
        <Link className="change-form" to="/login">Ingresar</Link>
      </p>

      <small className="login-note">El registro público es únicamente para clientes.</small>
    </div>
  );
};