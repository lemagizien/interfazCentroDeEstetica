import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "../../../components/Icon";
import { apiRequest } from "../../../services/api";
import {
  adminCentroService,
  type ProfesionalCentro,
  type ProfesionalFormulario,
  type ServicioCentro,
} from "../../../services/admin-centro.service";

interface Props { token: string; }
type Dia = "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
interface Franja {
  id?: number;
  profesional_id?: number;
  dia_semana: Dia;
  hora_inicio: string;
  hora_fin: string;
}
interface ConfigDia {
  dia: Dia;
  activo: boolean;
  desde: string;
  hasta: string;
}
const DIAS: { valor: Dia; nombre: string }[] = [
  { valor: "LUNES", nombre: "Lunes" },
  { valor: "MARTES", nombre: "Martes" },
  { valor: "MIERCOLES", nombre: "Miércoles" },
  { valor: "JUEVES", nombre: "Jueves" },
  { valor: "VIERNES", nombre: "Viernes" },
  { valor: "SABADO", nombre: "Sábado" },
  { valor: "DOMINGO", nombre: "Domingo" },
];
const nuevoFormulario = (): ProfesionalFormulario => ({
  nombre: "", apellido: "", email: "", telefono: "", especialidad: "", servicios: [],
});
const nuevaAgenda = (): ConfigDia[] => DIAS.map(({ valor }, i) => ({
  dia: valor, activo: i < 5, desde: "09:00", hasta: "18:00",
}));
const horaCorta = (hora: string) => hora.slice(0, 5);
const errorTexto = (error: unknown) =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado.";

export const ProfesionalesCentroSection = ({ token }: Props) => {
  const [profesionales, setProfesionales] = useState<ProfesionalCentro[]>([]);
  const [servicios, setServicios] = useState<ServicioCentro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState<1 | 2>(1);
  const [editando, setEditando] = useState<ProfesionalCentro | null>(null);
  const [datos, setDatos] = useState<ProfesionalFormulario>(nuevoFormulario());
  const [agenda, setAgenda] = useState<ConfigDia[]>(nuevaAgenda());
  const [franjasOriginales, setFranjasOriginales] = useState<Franja[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const listar = async () => {
    const resultado = await adminCentroService.listarProfesionales(token);
    setProfesionales(resultado);
  };

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    Promise.all([
      adminCentroService.listarProfesionales(token),
      adminCentroService.listarServicios(token),
    ]).then(([lista, catalogo]) => {
      if (!vigente) return;
      setProfesionales(lista);
      setServicios(catalogo);
    }).catch((e) => {
      if (vigente) setError(errorTexto(e));
    }).finally(() => {
      if (vigente) setCargando(false);
    });
    return () => { vigente = false; };
  }, [token]);

  const abrirNuevo = () => {
    setEditando(null);
    setDatos(nuevoFormulario());
    setAgenda(nuevaAgenda());
    setFranjasOriginales([]);
    setPaso(1);
    setError("");
    setMensaje("");
    setAbierto(true);
  };

  const cargarAgenda = async (id: number): Promise<Franja[]> => {
    const respuesta = await apiRequest<{ status: string; data: Franja[] }>(
      `/disponibilidades/profesional/${id}`, { method: "GET", token }
    );
    return respuesta.data;
  };

  const abrirEditar = async (profesional: ProfesionalCentro, soloHorarios = false) => {
    setProcesandoId(profesional.id);
    setError("");
    try {
      const existentes = await cargarAgenda(profesional.id);
      setEditando(profesional);
      setDatos({
        nombre: profesional.nombre,
        apellido: profesional.apellido,
        email: profesional.email,
        telefono: profesional.telefono ?? "",
        especialidad: profesional.especialidad ?? "",
        servicios: (profesional.servicios ?? []).map((s) => s.id),
      });
      setFranjasOriginales(existentes);
      setAgenda(DIAS.map(({ valor }) => {
        const primera = existentes.find((f) => f.dia_semana === valor);
        return {
          dia: valor,
          activo: Boolean(primera),
          desde: primera ? horaCorta(primera.hora_inicio) : "09:00",
          hasta: primera ? horaCorta(primera.hora_fin) : "18:00",
        };
      }));
      setPaso(soloHorarios ? 2 : 1);
      setAbierto(true);
    } catch (e) {
      setError(`No se pudo cargar la disponibilidad: ${errorTexto(e)}`);
    } finally {
      setProcesandoId(null);
    }
  };

  const cerrar = () => {
    if (guardando) return;
    setAbierto(false);
    setEditando(null);
  };

  const cambiarDia = (dia: Dia, cambios: Partial<ConfigDia>) => {
    setAgenda((anterior) =>
      anterior.map((item) => item.dia === dia ? { ...item, ...cambios } : item)
    );
  };

  const alternarServicio = (id: number) => {
    setDatos((anterior) => {
      const ids = anterior.servicios ?? [];
      return { ...anterior, servicios: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] };
    });
  };

  const siguiente = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!datos.nombre.trim() || !datos.apellido.trim() || !datos.email.trim()) {
      setError("Completá nombre, apellido y correo.");
      return;
    }
    setError("");
    setPaso(2);
  };

  const guardarAgenda = async (profesionalId: number, anteriores: Franja[]) => {
    // Un bloque por día en esta versión. Si existían varios, se conservan
    // únicamente cuando no se cambia ese día; nunca se eliminan silenciosamente.
    for (const config of agenda) {
      const anterioresDia = anteriores.filter((f) => f.dia_semana === config.dia);
      if (!config.activo) {
        for (const franja of anterioresDia) {
          await apiRequest(`/disponibilidades/${franja.id}`, { method: "DELETE", token });
        }
        continue;
      }
      if (config.desde >= config.hasta) {
        throw new Error(`El horario de ${DIAS.find((d) => d.valor === config.dia)?.nombre} debe terminar después de comenzar.`);
      }
      const sinCambios = anterioresDia.length === 1 &&
        horaCorta(anterioresDia[0].hora_inicio) === config.desde &&
        horaCorta(anterioresDia[0].hora_fin) === config.hasta;
      if (sinCambios) continue;
      if (anterioresDia.length > 1) {
        throw new Error(`El día ${config.dia} tiene varias franjas guardadas. Para evitar borrarlas, editá primero esa agenda desde el backend.`);
      }
      const body = JSON.stringify({
        dia_semana: config.dia, hora_inicio: config.desde, hora_fin: config.hasta,
      });
      if (anterioresDia.length === 1) {
        await apiRequest(`/disponibilidades/${anterioresDia[0].id}`, {
          method: "PUT", token, body,
        });
      } else {
        await apiRequest("/disponibilidades", {
          method: "POST", token,
          body: JSON.stringify({ profesional_id: profesionalId, ...JSON.parse(body) }),
        });
      }
    }
  };

  const guardar = async () => {
    if (guardando) return;
    setError("");
    if (!agenda.some((d) => d.activo)) {
      setError("Seleccioná al menos un día de atención.");
      return;
    }
    for (const dia of agenda) {
      if (dia.activo && dia.desde >= dia.hasta) {
        setError(`Revisá el horario de ${DIAS.find((d) => d.valor === dia.dia)?.nombre}.`);
        return;
      }
    }
    setGuardando(true);
    try {
      let id = editando?.id;
      if (editando) {
        await adminCentroService.actualizarProfesional(token, editando.id, {
          ...datos,
          nombre: datos.nombre.trim(),
          apellido: datos.apellido.trim(),
          email: datos.email.trim().toLowerCase(),
          telefono: datos.telefono?.trim() || null,
          especialidad: datos.especialidad?.trim() || null,
        });
      } else {
        const creado = await adminCentroService.crearProfesional(token, {
          ...datos,
          nombre: datos.nombre.trim(),
          apellido: datos.apellido.trim(),
          email: datos.email.trim().toLowerCase(),
          telefono: datos.telefono?.trim() || null,
          especialidad: datos.especialidad?.trim() || null,
        });
        id = creado.id;
      }
      if (!id) throw new Error("El backend no devolvió el ID del profesional.");
      await guardarAgenda(id, franjasOriginales);
      await listar();
      setMensaje(editando ? "Profesional y horarios actualizados." : "Profesional y horarios registrados.");
      setAbierto(false);
      setEditando(null);
    } catch (e) {
      setError(`No se pudo completar el guardado: ${errorTexto(e)}. Si el profesional ya se creó, podés abrir «Editar horarios» para terminar de configurarlo.`);
      await listar().catch(() => undefined);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (profesional: ProfesionalCentro) => {
    if (procesandoId !== null) return;
    const accion = profesional.activo ? "desactivar" : "activar";
    if (!window.confirm(`¿Querés ${accion} a ${profesional.nombre} ${profesional.apellido}?`)) return;
    setProcesandoId(profesional.id);
    setError("");
    try {
      if (profesional.activo) await adminCentroService.desactivarProfesional(token, profesional.id);
      else await adminCentroService.activarProfesional(token, profesional.id);
      await listar();
      setMensaje(`Profesional ${profesional.activo ? "desactivado" : "activado"}.`);
    } catch (e) {
      setError(errorTexto(e));
    } finally {
      setProcesandoId(null);
    }
  };

  const serviciosDisponibles = servicios.filter(
    (s) => s.activo || (datos.servicios ?? []).includes(s.id)
  );

  return (
    <>
      <section className="welcome">
        <span>
          <h2>Equipo de profesionales</h2>
          <p>Gestioná los profesionales, sus servicios y horarios de atención.</p>
        </span>
        <button type="button" className="primary-button" onClick={abierto ? cerrar : abrirNuevo} disabled={guardando}>
          {!abierto && <Icon name="plus" />}
          {abierto ? "Cancelar" : "Nuevo profesional"}
        </button>
      </section>

      {mensaje && <div className="admin-toast" role="status">{mensaje}</div>}
      {error && <p role="alert" style={{ color: "#b94f3e" }}>{error}</p>}

      {abierto && (
        <section className="panel admin-form-panel">
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 22 }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 30, height: 30, display: "grid", placeItems: "center",
                  borderRadius: "50%", background: paso === n ? "#c96e5a" : "#f4e7e2",
                  color: paso === n ? "white" : "#995d50", fontWeight: 700,
                }}>{n}</span>
                <strong style={{ fontSize: 13 }}>{n === 1 ? "Datos y servicios" : "Horarios"}</strong>
              </div>
            ))}
          </div>

          {paso === 1 ? (
            <form className="admin-form" onSubmit={siguiente}>
              <h3>{editando ? "Editar profesional" : "Registrar profesional"}</h3>
              <div className="form-grid-2">
                {([
                  ["nombre", "Nombre", "text"],
                  ["apellido", "Apellido", "text"],
                  ["email", "Correo electrónico", "email"],
                  ["telefono", "Teléfono", "tel"],
                  ["especialidad", "Especialidad", "text"],
                ] as const).map(([campo, titulo, tipo]) => (
                  <label key={campo}>
                    <span>{titulo}</span>
                    <input
                      type={tipo}
                      value={datos[campo] ?? ""}
                      onChange={(e) => setDatos((prev) => ({ ...prev, [campo]: e.target.value }))}
                      required={campo === "nombre" || campo === "apellido" || campo === "email"}
                    />
                  </label>
                ))}
              </div>
              <h4 style={{ marginTop: 24 }}>Servicios asignados</h4>
              <p style={{ fontSize: 13, color: "#777", marginBottom: 12 }}>Seleccioná los servicios que puede realizar.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 12 }}>
                {serviciosDisponibles.map((servicio) => {
                  const seleccionado = (datos.servicios ?? []).includes(servicio.id);
                  return (
                    <button key={servicio.id} type="button" aria-pressed={seleccionado}
                      onClick={() => alternarServicio(servicio.id)}
                      style={{
                        padding: 14, borderRadius: 12, minHeight: 94,
                        background: seleccionado ? "#fdf1ed" : "#fff",
                        border: seleccionado ? "2px solid #c96e5a" : "1px solid #e9dfd8",
                        textAlign: "left", cursor: "pointer", display: "flex",
                        flexDirection: "column", justifyContent: "space-between",
                      }}>
                      <span style={{ display: "flex", justifyContent: "space-between", color: "#c96e5a" }}>
                        <Icon name="scissors" />
                        <span aria-hidden="true">{seleccionado ? "✓" : "○"}</span>
                      </span>
                      <strong style={{ color: "#29242b" }}>{servicio.nombre}</strong>
                      <small style={{ color: "#a06456" }}>{seleccionado ? "Seleccionado" : "Seleccionar"}</small>
                    </button>
                  );
                })}
              </div>
              <div className="form-footer" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", gap: "14px", marginTop: "24px" }}>
                <button type="button" className="table-btn" onClick={cerrar}>Cancelar</button>
                <button type="submit" className="primary-button">Siguiente: horarios</button>
              </div>
            </form>
          ) : (
            <div className="admin-form">
              <h3>Disponibilidad semanal</h3>
              <p style={{ fontSize: 13, color: "#777" }}>Activá los días y elegí el horario de atención de cada uno.</p>
              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                {agenda.map((config) => (
                  <div key={config.dia} style={{
                    border: "1px solid #e9dfd8", borderRadius: 12, padding: 14,
                    background: config.activo ? "#fffaf8" : "#fff",
                  }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input type="checkbox" checked={config.activo}
                        onChange={(e) => cambiarDia(config.dia, { activo: e.target.checked })}
                        style={{ width: 18, height: 18, minWidth: 18, accentColor: "#c96e5a", flex: "none" }} />
                      <strong>{DIAS.find((d) => d.valor === config.dia)?.nombre}</strong>
                      <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
                        {config.activo ? "Atiende" : "No atiende"}
                      </span>
                    </label>
                    {config.activo && (
                      <div className="form-grid-2" style={{ marginTop: 12 }}>
                        <label>
                          <span>Desde</span>
                          <input type="time" value={config.desde}
                            onChange={(e) => cambiarDia(config.dia, { desde: e.target.value })} />
                        </label>
                        <label>
                          <span>Hasta</span>
                          <input type="time" value={config.hasta}
                            onChange={(e) => cambiarDia(config.dia, { hasta: e.target.value })} />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="form-footer" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", gap: "14px", marginTop: "24px" }}>
                <button type="button" className="table-btn" onClick={() => setPaso(1)} disabled={guardando}>Anterior</button>
                <button type="button" className="primary-button" onClick={() => void guardar()} disabled={guardando}>
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear profesional y horarios"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {cargando ? <p>Cargando profesionales...</p> : (
        <section className="panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Profesional</th><th>Correo</th><th>Especialidad</th>
                  <th>Servicios</th><th>Estado</th><th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profesionales.map((profesional) => (
                  <tr key={profesional.id}>
                    <td><div className="table-entity">
                      <span className="avatar avatar-list">{profesional.nombre.charAt(0)}{profesional.apellido.charAt(0)}</span>
                      <strong>{profesional.nombre} {profesional.apellido}</strong>
                    </div></td>
                    <td>{profesional.email}</td>
                    <td>{profesional.especialidad || "Sin especialidad"}</td>
                    <td>{profesional.servicios?.map((s) => s.nombre).join(", ") || "Sin servicios"}</td>
                    <td><span className={`status ${profesional.activo ? "" : "pending"}`}>
                      {profesional.activo ? "Activo" : "Inactivo"}
                    </span></td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button type="button" className="table-btn" disabled={procesandoId !== null || guardando}
                          onClick={() => void abrirEditar(profesional, false)}>Editar</button>
                        <button type="button" className="table-btn" disabled={procesandoId !== null || guardando}
                          onClick={() => void abrirEditar(profesional, true)}>Editar horarios</button>
                        <button type="button" className={profesional.activo ? "table-btn danger" : "table-btn"}
                          disabled={procesandoId !== null || guardando}
                          onClick={() => void cambiarEstado(profesional)}>
                          {procesandoId === profesional.id ? "Procesando..." : profesional.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {profesionales.length === 0 && <p>Todavía no hay profesionales registrados.</p>}
          </div>
        </section>
      )}
    </>
  );
};
