
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "../../../components/Icon";
import {
    adminCentroService,
    type ServicioCentro,
    type ServicioFormulario,
} from "../../../services/admin-centro.service";

interface ServiciosCentroSectionProps {
    token: string;
}

const formularioInicial: ServicioFormulario = {
    nombre: "",
    descripcion: "",
    precio: 0,
    duracion_minutos: 30,
};

export const ServiciosCentroSection = ({
    token,
}: ServiciosCentroSectionProps) => {
    const [servicios, setServicios] = useState<ServicioCentro[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [servicioEditar, setServicioEditar] =
        useState<ServicioCentro | null>(null);

    const [datos, setDatos] =
        useState<ServicioFormulario>(formularioInicial);

    const [guardando, setGuardando] = useState(false);
    const [procesandoId, setProcesandoId] =
        useState<number | null>(null);

    const cargarServicios = async () => {
        const resultado =
            await adminCentroService.listarServicios(token);

        setServicios(resultado);
    };

    useEffect(() => {
        let activo = true;

        setCargando(true);
        setError("");

        adminCentroService
            .listarServicios(token)
            .then((resultado) => {
                if (activo) setServicios(resultado);
            })
            .catch((err) => {
                if (activo) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudieron cargar los servicios."
                    );
                }
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, [token]);

    const abrirCrear = () => {
        setServicioEditar(null);
        setDatos({ ...formularioInicial });
        setError("");
        setMensaje("");
        setMostrarFormulario(true);
    };

    const abrirEditar = (servicio: ServicioCentro) => {
        setServicioEditar(servicio);

        setDatos({
            nombre: servicio.nombre,
            descripcion: servicio.descripcion ?? "",
            precio: Number(servicio.precio),
            duracion_minutos: servicio.duracion_minutos,
        });

        setError("");
        setMensaje("");
        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setMostrarFormulario(false);
        setServicioEditar(null);
    };

    const guardarServicio = async (
        evento: FormEvent<HTMLFormElement>
    ) => {
        evento.preventDefault();

        if (guardando) return;

        const datosNormalizados: ServicioFormulario = {
            ...datos,
            nombre: datos.nombre.trim(),
            descripcion: datos.descripcion?.trim() || null,
            precio: Number(datos.precio),
            duracion_minutos: Number(datos.duracion_minutos),
        };

        if (datosNormalizados.nombre.length < 3) {
            setError("El nombre debe tener al menos 3 caracteres.");
            return;
        }

        if (
            !Number.isFinite(datosNormalizados.precio) ||
            datosNormalizados.precio <= 0
        ) {
            setError("El precio debe ser mayor a cero.");
            return;
        }

        if (
            !Number.isInteger(datosNormalizados.duracion_minutos) ||
            datosNormalizados.duracion_minutos <= 0
        ) {
            setError("La duración debe ser un número entero positivo.");
            return;
        }

        setGuardando(true);
        setError("");
        setMensaje("");

        try {
            if (servicioEditar) {
                await adminCentroService.actualizarServicio(
                    token,
                    servicioEditar.id,
                    datosNormalizados
                );
            } else {
                await adminCentroService.crearServicio(
                    token,
                    datosNormalizados
                );
            }

            await cargarServicios();

            setMensaje(
                servicioEditar
                    ? "Servicio actualizado correctamente."
                    : "Servicio creado correctamente."
            );

            cerrarFormulario();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el servicio."
            );
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstado = async (servicio: ServicioCentro) => {
        if (procesandoId !== null || guardando) return;

        const accion = servicio.activo ? "desactivar" : "activar";

        const confirmado = window.confirm(
            `¿Querés ${accion} el servicio "${servicio.nombre}"?`
        );

        if (!confirmado) return;

        setProcesandoId(servicio.id);
        setError("");
        setMensaje("");

        try {
            if (servicio.activo) {
                await adminCentroService.desactivarServicio(
                    token,
                    servicio.id
                );
            } else {
                await adminCentroService.activarServicio(
                    token,
                    servicio.id
                );
            }

            await cargarServicios();

            setMensaje(
                `Servicio ${servicio.activo ? "desactivado" : "activado"} correctamente.`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo cambiar el estado del servicio."
            );
        } finally {
            setProcesandoId(null);
        }
    };

    return (
        <>
            <section className="welcome">
                <span>
                    <h2>Catálogo de servicios</h2>
                    <p>
                        Administrá los servicios que ofrece tu centro.
                    </p>
                </span>

                <button
                    type="button"
                    className="primary-button"
                    onClick={
                        mostrarFormulario ? cerrarFormulario : abrirCrear
                    }
                    disabled={guardando}
                >
                    {!mostrarFormulario && <Icon name="plus" />}
                    {mostrarFormulario ? "Cancelar" : "Nuevo servicio"}
                </button>
            </section>

            {mensaje && (
                <div className="admin-toast" role="status">
                    {mensaje}
                </div>
            )}

            {error && (
                <p role="alert" style={{ color: "var(--coral-dark)" }}>
                    {error}
                </p>
            )}

            {mostrarFormulario && (
                <section className="panel admin-form-panel">
                    <h3>
                        {servicioEditar
                            ? "Editar servicio"
                            : "Registrar nuevo servicio"}
                    </h3>

                    <form
                        className="admin-form"
                        onSubmit={guardarServicio}
                    >
                        <div className="form-grid-2">
                            <label>
                                <span>Nombre del servicio</span>
                                <input
                                    type="text"
                                    value={datos.nombre}
                                    onChange={(e) =>
                                        setDatos((anterior) => ({
                                            ...anterior,
                                            nombre: e.target.value,
                                        }))
                                    }
                                    placeholder="Ej: Corte de cabello"
                                    minLength={3}
                                    maxLength={100}
                                    required
                                />
                            </label>

                            <label>
                                <span>Descripción</span>
                                <input
                                    type="text"
                                    value={datos.descripcion ?? ""}
                                    onChange={(e) =>
                                        setDatos((anterior) => ({
                                            ...anterior,
                                            descripcion: e.target.value,
                                        }))
                                    }
                                    placeholder="Ej: Corte clásico y moderno"
                                />
                            </label>

                            <label>
                                <span>Duración (minutos)</span>
                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={datos.duracion_minutos}
                                    onChange={(e) =>
                                        setDatos((anterior) => ({
                                            ...anterior,
                                            duracion_minutos: Number(e.target.value),
                                        }))
                                    }
                                    required
                                />
                            </label>

                            <label>
                                <span>Precio ($)</span>

                                <input
                                    type="number"
                                    min={0.01}
                                    step={0.01}
                                    value={datos.precio === 0 ? "" : datos.precio}
                                    onChange={(e) =>
                                        setDatos((anterior) => ({
                                            ...anterior,
                                            precio:
                                                e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value),
                                        }))
                                    }
                                    placeholder="Ej: 20000"
                                    required
                                />

                            </label>
                        </div>

                        <div className="form-footer">
                            <button
                                type="button"
                                className="table-btn"
                                onClick={cerrarFormulario}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={guardando}
                            >
                                {guardando
                                    ? "Guardando..."
                                    : servicioEditar
                                        ? "Guardar cambios"
                                        : "Crear servicio"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {cargando ? (
                <p>Cargando servicios...</p>
            ) : (
                <section className="panel">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Servicio</th>
                                    <th>Descripción</th>
                                    <th>Duración</th>
                                    <th>Precio</th>
                                    <th>Estado</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {servicios.map((servicio) => (
                                    <tr key={servicio.id}>
                                        <td>
                                            <strong>{servicio.nombre}</strong>
                                        </td>

                                        <td>
                                            {servicio.descripcion || "Sin descripción"}
                                        </td>

                                        <td>
                                            {servicio.duracion_minutos} min
                                        </td>

                                        <td>
                                            <strong>
                                                {Number(servicio.precio).toLocaleString(
                                                    "es-AR",
                                                    {
                                                        style: "currency",
                                                        currency: "ARS",
                                                    }
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                className={`status ${servicio.activo ? "" : "pending"
                                                    }`}
                                            >
                                                {servicio.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>

                                        <td className="text-right">
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="table-btn"
                                                    onClick={() => abrirEditar(servicio)}
                                                    disabled={procesandoId !== null || guardando}
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        servicio.activo
                                                            ? "table-btn danger"
                                                            : "table-btn"
                                                    }
                                                    onClick={() => cambiarEstado(servicio)}
                                                    disabled={procesandoId !== null || guardando}
                                                >
                                                    {procesandoId === servicio.id
                                                        ? "Procesando..."
                                                        : servicio.activo
                                                            ? "Desactivar"
                                                            : "Activar"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {servicios.length === 0 && !error && (
                            <p>No hay servicios registrados en este centro.</p>
                        )}
                    </div>
                </section>
            )}
        </>
    );
};
