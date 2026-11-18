import { Icon } from "@/components/Icon";
import { type SubmitEvent, useState } from "react";
import { ClientUser } from "../types/ClientUser";
import "./ClientAuthModal.css";

export type AuthModalIntent = "login" | "booking";
type AuthStep = "email" | "login" | "register"; // a futuro: | "verify"

interface ClientAuthModalProps {
  isOpen: boolean;
  intent: AuthModalIntent;
  businessId: string;
  businessName: string;
  onClose: () => void;
  onSuccess: (user: ClientUser) => void;
}

// Temporal para probar el flujo hasta conectar el endpoint GET/POST check-email
const MOCK_REGISTERED_EMAILS = ["ana@mail.com", "cliente@almaestetica.com"];

export const ClientAuthModal = ({
  isOpen,
  intent,
  businessId,
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

  if (!isOpen) return null;

  const getInitials = (fullName: string) =>
    fullName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CL";

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

  // Paso 1: Verificar si el correo existe en la BD del negocio
  const handleCheckEmail = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Reemplazar por llamada real al backend:
      // const { exists } = await api.post("/auth/check-email", { businessId, email: normalizedEmail });
      await new Promise((resolve) => setTimeout(resolve, 250));
      const exists = MOCK_REGISTERED_EMAILS.includes(normalizedEmail);

      setEmail(normalizedEmail);
      setStep(exists ? "login" : "register");
    } catch {
      setError("No pudimos verificar tu correo. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2A: Login con email + contraseña -> devuelve JWT y ClientUser
  const handleLoginSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Reemplazar por llamada real al backend:
      // const { token, user } = await api.post("/auth/login", { businessId, email, password });
      // localStorage.setItem("client_token", token);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const fallbackName = email.split("@")[0];
      onSuccess({
        name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
        initials: getInitials(fallbackName),
        email,
      });
      setStep("email");
      setPassword("");
    } catch {
      setError("Contraseña incorrecta. Revisala e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2B: Registro con nombre + email + contraseña -> devuelve JWT y ClientUser
  const handleRegisterSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !password) return;
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Reemplazar por llamada real al backend:
      // const { token, user } = await api.post("/auth/register", { businessId, name: name.trim(), email, password });
      // Cuando implementes OTP en el backend, acá pasarías a setStep("verify") antes de llamar a onSuccess
      await new Promise((resolve) => setTimeout(resolve, 300));

      const cleanName = name.trim();
      onSuccess({
        name: cleanName,
        initials: getInitials(cleanName),
        email,
      });
      setStep("email");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("No pudimos crear tu cuenta. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
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
          </form>
        )}

        {/* Paso 2A: Usuario existente -> Contraseña */}
        {step === "login" && (
          <form onSubmit={handleLoginSubmit} className="modal-form">
            <div className="modal-email-pill">
              <span>{email}</span>
              <button type="button" className="modal-link-btn" onClick={handleChangeEmail}>
                Cambiar
              </button>
            </div>

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
          </form>
        )}

        {/* Paso 2B: Usuario nuevo -> Aviso + Nombre + Contraseña */}
        {step === "register" && (
          <form onSubmit={handleRegisterSubmit} className="modal-form">
            <div className="modal-email-pill">
              <span>{email}</span>
              <button type="button" className="modal-link-btn" onClick={handleChangeEmail}>
                Cambiar
              </button>
            </div>

            <p className="modal-notice">
              No encontramos una cuenta con este correo. Completá tus datos para registrarte.
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
              minLength={8}
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
              minLength={8}
              required
            />
            {error && <p className="modal-error">{error}</p>}
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Creando cuenta..." : <>{submitLabel} <Icon name="arrow" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};