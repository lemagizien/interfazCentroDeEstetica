import { Icon } from "@/components/Icon";
import { type SubmitEvent, useEffect, useState } from "react";
import { type ClientUser } from "../types/ClientUser";
import { apiRequest, ApiError } from "@/services/api";
import "./ClientAuthModal.css";

export type AuthModalIntent = "login" | "booking";
type AuthStep = "email" | "login" | "register";

interface ClientAuthModalProps {
  isOpen: boolean;
  intent: AuthModalIntent;
  initialMode?: "login" | "register";
  businessId: string;
  businessName: string;
  onClose: () => void;
  onSuccess: (user: ClientUser) => void;
}

interface LoginResult {
  token: string;
  usuario: { id: number; nombre: string; email: string; rol: string; centro_id: number };
}

const initials = (fullName: string) => fullName.trim().split(/\s+/).slice(0, 2)
  .map((part) => part.charAt(0).toUpperCase()).join("") || "CL";


export const ClientAuthModal = ({
  isOpen,
  intent,
  initialMode = "login",
  businessId: _businessId,
  businessName,
  onClose,
  onSuccess,
}: ClientAuthModalProps) => {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(initialMode);
      setEmail("");
      setName("");
      setPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // La ruta pública del proyecto es /:businessSlug.
  const slug = decodeURIComponent(window.location.pathname.split("/").filter(Boolean)[0] || "");
  const base = `/auth/centros/${encodeURIComponent(slug)}`;

  const completarLogin = (respuesta: LoginResult) => {
    if (respuesta.usuario.rol !== "CLIENTE") {
      throw new Error("Esta pantalla es exclusiva para clientes.");
    }
    sessionStorage.setItem(`agendia_cliente_token_${slug}`, respuesta.token);
    sessionStorage.setItem(`agendia_cliente_usuario_${slug}`, JSON.stringify(respuesta.usuario));
    const nombre = respuesta.usuario.nombre;
    onSuccess({ id: String(respuesta.usuario.id), name: nombre,
      initials: initials(nombre), email: respuesta.usuario.email });
    setStep("email");
    setPassword("");
    setConfirmPassword("");
  };

  const mostrarError = (e: unknown) => {
    setError(e instanceof Error ? e.message : "No se pudo completar la operación.");
  };

  const resetAndClose = () => {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    onClose();
  };

  const handleChangeEmail = () => {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  // El backend no tiene check-email público. El usuario elige ingresar o registrarse.
  const handleCheckEmail = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmail(email.trim().toLowerCase());
    setError(null);
    setStep("login");
  };

  const handleLoginSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const respuesta = await apiRequest<LoginResult>(`${base}/login`, {
        method: "POST", body: JSON.stringify({ email, password }),
      });
      completarLogin(respuesta);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setError("Correo o contraseña incorrectos. Si todavía no tenés cuenta, elegí Registrarme.");
      } else mostrarError(e);
    } finally { setLoading(false); }
  };

  const handleRegisterSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest(`${base}/registro`, {
        method: "POST",
        body: JSON.stringify({ nombre: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const respuesta = await apiRequest<LoginResult>(`${base}/login`, {
        method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      completarLogin(respuesta);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError("Este correo ya está registrado en el centro. Elegí Iniciar sesión.");
      } else mostrarError(e);
    } finally { setLoading(false); }
  };

  const titleByStep: Record<AuthStep, string> = {
    email: "Ingresar",
    login: "Te damos la bienvenida",
    register: "Completá tu registro",
  };

  const emailSubtitle =
    intent === "booking"
      ? "Ingresá tu correo electrónico para confirmar tu turno."
      : "Ingresá tu correo electrónico para continuar.";

  const submitLabel =
    step === "login"
      ? intent === "booking"
        ? "Ingresar y confirmar turno"
        : "Ingresar"
      : intent === "booking"
      ? "Crear cuenta y confirmar turno"
      : "Crear cuenta";

  return (
    <div className="modal-backdrop" onClick={resetAndClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={resetAndClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="modal-header">
          <small>{businessName}</small>
          <h3>{titleByStep[step]}</h3>
          {step === "email" && <p>{emailSubtitle}</p>}
        </div>

        {/* Paso 1: Solo Email */}
        {step === "email" && (
          <form onSubmit={handleCheckEmail} className="modal-form">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            {error && <p className="modal-error">{error}</p>}
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Verificando..." : <>Continuar <Icon name="arrow" /></>}
            </button>
            <button type="button" className="modal-link-btn" onClick={() => { setStep("register"); setError(null); }}>
              ¿Todavía no tenés cuenta? Registrarme
            </button>
          </form>
        )}

        {/* Paso 2A: Usuario existente -> Contraseña */}
        {step === "login" && (
          <form onSubmit={handleLoginSubmit} className="modal-form">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              autoComplete="email"
              required
            />

            <input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            {error && <p className="modal-error">{error}</p>}
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Ingresando..." : <>{submitLabel} <Icon name="arrow" /></>}
            </button>
            <button type="button" className="modal-link-btn" onClick={() => { setStep("register"); setError(null); }}>
              ¿No tenés cuenta? Registrarme
            </button>
          </form>
        )}

        {/* Paso 2B: Usuario nuevo -> Aviso + Nombre + Contraseña */}
        {step === "register" && (
          <form onSubmit={handleRegisterSubmit} className="modal-form">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              autoComplete="email"
              required
            />

            <p className="modal-notice">
              Completá tus datos para crear una cuenta en este centro.
            </p>

            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
            <input
              type="password"
              placeholder="Creá una contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              minLength={6}
              required
            />
            <input
              type="password"
              placeholder="Repetí la contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              minLength={6}
              required
            />
            {error && <p className="modal-error">{error}</p>}
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Creando cuenta..." : <>{submitLabel} <Icon name="arrow" /></>}
            </button>
            <button type="button" className="modal-link-btn" onClick={() => { setStep("login"); setError(null); }}>
              ¿Ya tenés cuenta? Iniciar sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
};