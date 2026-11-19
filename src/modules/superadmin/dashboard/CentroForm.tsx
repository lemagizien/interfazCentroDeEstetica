
import { useState, type FormEvent } from "react";
import {
    superadminService,
    type Centro,
    type CentroFormulario,
} from "../../../services/superadmin.service";

interface CentroFormProps {
    centroEditar?: Centro;
    onCreado: (centro: Centro) => void;
    onCancelar: () => void;
}

export const CentroForm = ({
    centroEditar,
    onCreado,
    onCancelar,
}: CentroFormProps) => {
    const [datos, setDatos] = useState<CentroFormulario>({
        nombre: centroEditar?.nombre ?? "",
        slug: centroEditar?.slug ?? "",
        direccion: centroEditar?.direccion ?? "",
        telefono: centroEditar?.telefono ?? "",
        email: centroEditar?.email ?? "",
        tiempo_entre_turnos: centroEditar?.tiempo_entre_turnos ?? 0,
    });

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    const actualizarCampo = (
        campo: keyof CentroFormulario,
        valor: string | number
    ) => {
        setDatos((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    };

    const guardarCentro = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        if (guardando) return;

        setError("");
        setGuardando(true);

        try {
            const datosNormalizados = {
                ...datos,
                nombre: datos.nombre.trim(),
                slug: datos.slug.trim().toLowerCase(),
                direccion: datos.direccion?.trim() || null,
                telefono: datos.telefono?.trim() || null,
                email: datos.email?.trim() || null,
            };

            const centroGuardado = centroEditar
                ? await superadminService.actualizarCentro(
                    centroEditar.id,
                    datosNormalizados
                )
                : await superadminService.crearCentro(datosNormalizados);

            onCreado(centroGuardado);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo crear el centro."
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <section className="superadmin-recent">
            <h2>
                {centroEditar ? "Editar centro" : "Registrar nuevo centro"}
            </h2>

            <form onSubmit={guardarCentro}>
                <div>
                    <label htmlFor="centro-nombre">Nombre del centro</label>
                    <input
                        id="centro-nombre"
                        type="text"
                        value={datos.nombre}
                        onChange={(e) =>
                            actualizarCampo("nombre", e.target.value)
                        }
                        required
                        maxLength={120}
                        placeholder="Ej: Estética Bella"
                    />
                </div>

                <div>
                    <label htmlFor="centro-slug">Slug</label>
                    <input
                        id="centro-slug"
                        type="text"
                        value={datos.slug}
                        onChange={(e) =>
                            actualizarCampo(
                                "slug",
                                e.target.value.toLowerCase()
                            )
                        }
                        required
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        title="Usá minúsculas, números y guiones."
                        placeholder="Ej: estetica-bella"
                    />
                </div>

                <div>
                    <label htmlFor="centro-direccion">Dirección</label>
                    <input
                        id="centro-direccion"
                        type="text"
                        value={datos.direccion ?? ""}
                        onChange={(e) =>
                            actualizarCampo("direccion", e.target.value)
                        }
                        placeholder="Ej: Av. Siempre Viva 123"
                    />
                </div>

                <div>
                    <label htmlFor="centro-telefono">Teléfono</label>
                    <input
                        id="centro-telefono"
                        type="tel"
                        value={datos.telefono ?? ""}
                        onChange={(e) =>
                            actualizarCampo("telefono", e.target.value)
                        }
                        placeholder="Ej: 1123456789"
                    />
                </div>

                <div>
                    <label htmlFor="centro-email">Correo electrónico</label>
                    <input
                        id="centro-email"
                        type="email"
                        value={datos.email ?? ""}
                        onChange={(e) =>
                            actualizarCampo("email", e.target.value)
                        }
                        placeholder="Ej: contacto@centro.com"
                    />
                </div>

                <div>
                    <label htmlFor="centro-intervalo">
                        Tiempo entre turnos
                    </label>
                    <select
                        id="centro-intervalo"
                        value={datos.tiempo_entre_turnos}
                        onChange={(e) =>
                            actualizarCampo(
                                "tiempo_entre_turnos",
                                Number(e.target.value)
                            )
                        }
                    >
                        <option value={0}>Sin intervalo</option>
                        <option value={5}>5 minutos</option>
                        <option value={10}>10 minutos</option>
                        <option value={15}>15 minutos</option>
                        <option value={20}>20 minutos</option>
                    </select>
                </div>

                {error && <p role="alert">{error}</p>}

                <div>
                    <button type="submit" disabled={guardando}>
                        {guardando
                            ? "Guardando..."
                            : centroEditar
                                ? "Guardar cambios"
                                : "Guardar centro"}
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
