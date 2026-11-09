import { useState } from "react";
import { Brand } from "../components/Brand";
import { Icon } from "../utils/icons";

export function LoginView({ enter }: { enter: (role: "client" | "admin") => void }) {
  const [register, setRegister] = useState(false);
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand"><Brand /></div>
        <div className="login-quote">
          <span className="eyebrow"><Icon name="sparkle" size={14} /> BIENESTAR A TU MANERA</span>
          <h1>Tu momento,<br /><em>tu espacio.</em></h1>
          <p>Reservá experiencias de cuidado pensadas especialmente para vos.</p>
        </div>
        <small className="photo-credit">Fotografía de Unsplash</small>
      </section>
      <section className="login-form-wrap">
        <div className="login-form">
          <span className="mobile-brand"><Brand /></span>
          <div className="login-heading">
            <span className="login-icon"><Icon name="user" /></span>
            <h2>{register ? "Creá tu cuenta" : "Qué bueno verte de nuevo"}</h2>
            <p>{register ? "Registrate como cliente para empezar a reservar." : "Ingresá a tu cuenta para gestionar tus turnos."}</p>
          </div>
          {register && (
            <label>
              Nombre completo
              <input type="text" placeholder="Martina Morales" />
            </label>
          )}
          <label>
            Correo electrónico
            <input type="email" placeholder="tu@email.com" />
          </label>
          <label>
            <span>Contraseña {!register && <button>¿La olvidaste?</button>}</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="primary-button login-submit" onClick={() => enter("client")}>
            {register ? "Crear cuenta" : "Ingresar"} <Icon name="arrow" />
          </button>
          <div className="login-separator"><span>o probá la demo</span></div>
          <button className="admin-demo" onClick={() => enter("admin")}><Icon name="grid" /> Ingresar como administrador</button>
          <p className="register-prompt">
            {register ? "¿Ya tenés una cuenta?" : "¿Todavía no tenés cuenta?"}
            <button onClick={() => setRegister(!register)}>{register ? " Ingresá" : " Registrate gratis"}</button>
          </p>
          <small className="login-note">El registro público crea únicamente cuentas con rol cliente.</small>
        </div>
      </section>
    </main>
  );
}

