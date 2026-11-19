
import { useState, type FormEvent } from "react";
import {
  superadminService,
  type Centro,
  type AdministradorCentro,
  type AdministradorFormulario,
} from "../../../services/superadmin.service";

interface AdministradorFormProps {
  centros: Centro[];
  onCreado: (administrador: AdministradorCentro) => void;
  onCancelar: () => void;
}

export const AdministradorForm = ({
  centros,
  onCreado,
  onCancelar,
}: AdministradorFormProps) => {
  const [datos, setDatos] = useState<AdministradorFormulario>({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    rol: "ADMIN_CENTRO",
    centro_id: 0,
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const centrosActivos = centros.filter((centro) => centro.activo);

  const guardarAdministrador = async (
    evento: FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();

    if (guardando) return;

    if (!datos.centro_id) {
      setError("Seleccioná un centro para el administrador.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const respuesta =
        await superadminService.registrarAdministrador({
          ...datos,
          nombre: datos.nombre.trim(),
          email: datos.email.trim().toLowerCase(),
          telefono: datos.telefono?.trim() || undefined,
        });

      onCreado(respuesta.usuario);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el administrador."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="superadmin-recent">
      <h2>Registrar administrador</h2>

      <form onSubmit={guardarAdministrador}>
        <div>
          <label htmlFor="admin-nombre">Nombre completo</label>
          <input
            id="admin-nombre"
            type="text"
            value={datos.nombre}
            onChange={(e) =>
              setDatos((anterior) => ({
                ...anterior,
                nombre: e.target.value,
              }))
            }
            placeholder="Ej: María González"
            required
          />
        </div>

        <div>
          <label htmlFor="admin-email">Correo electrónico</label>
          <input
            id="admin-email"
            type="email"
            value={datos.email}
            onChange={(e) =>
              setDatos((anterior) => ({
                ...anterior,
                email: e.target.value,
              }))
            }
            placeholder="Ej: maria@centro.com"
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            type="password"
            value={datos.password}
            onChange={(e) =>
              setDatos((anterior) => ({
                ...anterior,
                password: e.target.value,
              }))
            }
            placeholder="Ingresá una contraseña"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="admin-telefono">Teléfono</label>
          <input
            id="admin-telefono"
            type="tel"
            value={datos.telefono ?? ""}
            onChange={(e) =>
              setDatos((anterior) => ({
                ...anterior,
                telefono: e.target.value,
              }))
            }
            placeholder="Ej: 1123456789"
          />
        </div>

        <div>
          <label htmlFor="admin-centro">Centro asignado</label>
          <select
            id="admin-centro"
            value={datos.centro_id}
            onChange={(e) =>
              setDatos((anterior) => ({
                ...anterior,
                centro_id: Number(e.target.value),
              }))
            }
            required
          >
            <option value={0} disabled>
              Seleccioná un centro
            </option>

            {centrosActivos.map((centro) => (
              <option key={centro.id} value={centro.id}>
                {centro.nombre}
              </option>
            ))}
          </select>
        </div>

        {error && <p role="alert">{error}</p>}

        <div>
          <button type="submit" disabled={guardando}>
            {guardando
              ? "Registrando..."
              : "Crear administrador"}
          </button>

          <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
};
