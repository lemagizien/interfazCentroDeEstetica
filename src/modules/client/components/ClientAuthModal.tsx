import { Icon } from "@/components/Icon";
import { type SubmitEvent, useState } from "react";
import { ClientUser } from "../types/ClientUser";
import "./ClientAuthModal.css";

interface ClientAuthModalProps {
  isOpen: boolean;
  businessId: string;
  businessName: string;
  onClose: () => void;
  onSuccess: (user: ClientUser) => void;
}

export const ClientAuthModal = ({
  isOpen,
  businessId,
  businessName,
  onClose,
  onSuccess,
}: ClientAuthModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const getInitials = (fullName: string) =>
    fullName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CL";

  const handleGoogleLogin = () => {
    // Acá luego conectás Google OAuth enviando businessId
    console.log("Login con Google para negocio:", businessId);
    onSuccess({ name: "Martina", initials: "MM", email: "martina@email.com" });
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Acá luego llamás a tu endpoint enviando { businessId, name, email }
    const displayName = name.trim() || email.split("@")[0];
    onSuccess({
      name: displayName,
      initials: getInitials(displayName),
      email: email.trim(),
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="modal-header">
          <small>{businessName}</small>
          <h3>Ingresá para gestionar tu turno</h3>
          <p>Tus datos quedan asociados únicamente a este centro.</p>
        </div>

        <button type="button" className="google-button" onClick={handleGoogleLogin}>
          Continuar con Google
        </button>

        <div className="modal-divider">
          <span>o con tu email</span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="primary-button">
            Continuar <Icon name="arrow" />
          </button>
        </form>
      </div>
    </div>
  );
};