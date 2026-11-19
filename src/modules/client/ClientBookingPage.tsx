import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { Icon, type IconName } from "../../components/Icon";
import { TenantBrand } from "@/components/TenantBrand";
import { apiRequest } from "@/services/api";
import { ClientAuthModal, type AuthModalIntent } from "./components/ClientAuthModal";
import type { ClientUser } from "./types/ClientUser";

type Respuesta<T> = { status: string; data: T };
type Centro = { id: number; nombre: string; direccion?: string; slug: string; activo?: boolean; banner_url?: string | null; titulo_pagina?: string | null; descripcion_pagina?: string | null };
type Servicio = { id: number; nombre: string; descripcion?: string; precio: number | string; duracion_minutos: number; activo?: boolean };
type Profesional = { id: number; nombre: string; apellido: string; especialidad?: string };
type Horario = { inicio: string; fin?: string };
type TurnoCliente = {
  id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string | null;
  estado: string;
  servicio?: { nombre: string; precio?: number | string; duracion_minutos?: number } | null;
  profesional?: { nombre: string; apellido: string } | null;
};
const fechaHoraArgentina = (iso: string) => new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires", weekday: "long", day: "numeric",
  month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).format(new Date(iso));
const estadoTurno = (estado: string) => ({
  reservado: "Reservado", confirmado: "Confirmado", cancelado: "Cancelado",
  completado: "Completado", finalizado: "Finalizado",
}[estado.toLowerCase()] ?? estado);

type ReservaConfirmada = {
  centro: string;
  servicio: string;
  profesional: string;
  fechaHora: string;
  duracion: number;
  precio: number | string;
  direccion?: string;
};
const ZONA = "America/Argentina/Buenos_Aires";
const API_ORIGEN = new URL(import.meta.env.VITE_API_URL || "http://localhost:4000/api").origin;
const hoyArgentina = () => new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const sumarDias = (fecha: string, dias: number) => { const [y,m,d] = fecha.split("-").map(Number); return new Date(Date.UTC(y,m-1,d+dias)).toISOString().slice(0,10); };
const fechaVisible = (fecha: string) => new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${fecha}T12:00:00Z`));
const horaArgentina = (iso: string) => new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
const precioArgentina = (precio: number | string) => { const valor = Number(precio); return Number.isFinite(valor) ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(valor) : String(precio); };
const errorMensaje = (e: unknown) => e instanceof Error ? e.message : "Ocurrió un error inesperado.";

export const ClientBookingPage = () => {
  const { businessSlug = "" } = useParams<{ businessSlug: string }>();
  const slug = encodeURIComponent(businessSlug);
  const claveToken = `agendia_cliente_token_${businessSlug}`;
  const claveUsuario = `agendia_cliente_usuario_${businessSlug}`;
  const [centro, setCentro] = useState<Centro | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [profesionalId, setProfesionalId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(hoyArgentina);
  const [horario, setHorario] = useState("");
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<AuthModalIntent>("login");
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [misTurnosOpen, setMisTurnosOpen] = useState(false);
  const [misTurnos, setMisTurnos] = useState<TurnoCliente[]>([]);
  const [cargandoMisTurnos, setCargandoMisTurnos] = useState(false);
  const [errorMisTurnos, setErrorMisTurnos] = useState("");

  const [cargando, setCargando] = useState(true);
  const [cargandoProfesionales, setCargandoProfesionales] = useState(false);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState<ReservaConfirmada | null>(null);
  const reservaPendiente = useRef<{ servicio_id: number; profesional_id: number; fecha_hora_inicio: string } | null>(null);
  const reservaEnCurso = useRef(false);

  useEffect(() => {
    try {
      const token = sessionStorage.getItem(claveToken);
      const raw = sessionStorage.getItem(claveUsuario);
      if (token && raw) {
        const usuario = JSON.parse(raw) as { id: number; nombre: string; email: string };
        const nombre = usuario.nombre || "Cliente";
        setClientUser({ id: String(usuario.id), name: nombre, email: usuario.email, initials: nombre.split(/\s+/).slice(0,2).map(s => s[0]?.toUpperCase() ?? "").join("") });
      }
    } catch { sessionStorage.removeItem(claveUsuario); sessionStorage.removeItem(claveToken); }
  }, [claveToken, claveUsuario]);

  useEffect(() => {
    let vigente = true;
    setCargando(true); setError(""); setCentro(null); setServicios([]); setServicioId(null);
    Promise.all([
      apiRequest<Respuesta<Centro>>(`/centros/publico/${slug}`),
      apiRequest<Respuesta<Servicio[]>>(`/centros/publico/${slug}/servicios`),
    ]).then(([centroR, serviciosR]) => {
      if (!vigente) return;
      setCentro(centroR.data);
      const activos = serviciosR.data.filter(s => s.activo !== false);
      setServicios(activos);
      setServicioId(null);
    }).catch(e => { if (vigente) setError(errorMensaje(e)); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [slug]);

  useEffect(() => {
    let vigente = true;
    setProfesionales([]); setProfesionalId(null); setHorarios([]); setHorario(""); setConfirmado(false);
    if (!servicioId) return;
    setCargandoProfesionales(true);
    apiRequest<Respuesta<Profesional[]>>(`/centros/publico/${slug}/profesionales?servicio_id=${servicioId}`)
      .then(r => { if (vigente) { setProfesionales(r.data); setProfesionalId(null); } })
      .catch(e => { if (vigente) setError(errorMensaje(e)); })
      .finally(() => { if (vigente) setCargandoProfesionales(false); });
    return () => { vigente = false; };
  }, [slug, servicioId]);

  useEffect(() => {
    let vigente = true;
    setHorarios([]); setHorario(""); setConfirmado(false);
    if (!servicioId || !profesionalId || !fecha) return;
    setCargandoHorarios(true);
    const query = new URLSearchParams({ servicio_id: String(servicioId), profesional_id: String(profesionalId), fecha });
    apiRequest<Respuesta<{ horarios: Horario[] }>>(`/centros/publico/${slug}/horarios-disponibles?${query}`)
      .then(r => { if (vigente) setHorarios(r.data.horarios ?? []); })
      .catch(e => { if (vigente) setError(errorMensaje(e)); })
      .finally(() => { if (vigente) setCargandoHorarios(false); });
    return () => { vigente = false; };
  }, [slug, servicioId, profesionalId, fecha]);

  const fechas = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const iso = sumarDias(hoyArgentina(), i);
    const date = new Date(`${iso}T12:00:00Z`);
    return { iso, dia: new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", weekday: "short" }).format(date), numero: date.getUTCDate(), mes: new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", month: "short" }).format(date) };
  }), []);
  const reiniciarSeleccion = () => {
    reservaPendiente.current = null;
    setServicioId(null);
    setProfesionalId(null);
    setProfesionales([]);
    setHorarios([]);
    setFecha(hoyArgentina());
    setHorario("");
    setConfirmado(false);
    setError("");
  };
  const servicio = servicios.find(s => s.id === servicioId);
  const profesional = profesionales.find(p => p.id === profesionalId);
  const confirmarReserva = async (token: string, seleccion: { servicio_id: number; profesional_id: number; fecha_hora_inicio: string }) => {
    if (reservaEnCurso.current) return;
    reservaEnCurso.current = true;
    setGuardando(true);
    setError("");
    setConfirmado(false);
    try {
      await apiRequest("/turnos", { method: "POST", token, body: JSON.stringify(seleccion) });
      reservaPendiente.current = null;
      // Guardamos una foto de los datos confirmados: el modal no cambia
      // aunque el usuario seleccione otro servicio o fecha después.
      const servicioReservado = servicios.find((s) => s.id === seleccion.servicio_id);
      const profesionalReservado = profesionales.find((p) => p.id === seleccion.profesional_id);
      setReservaConfirmada({
        centro: centro?.nombre ?? "Centro",
        servicio: servicioReservado?.nombre ?? "Servicio reservado",
        profesional: profesionalReservado ? `${profesionalReservado.nombre} ${profesionalReservado.apellido}` : "Profesional asignado",
        fechaHora: seleccion.fecha_hora_inicio,
        duracion: servicioReservado?.duracion_minutos ?? 0,
        precio: servicioReservado?.precio ?? 0,
        direccion: centro?.direccion,
      });
      setConfirmado(true);
      // Se conserva la foto del turno para el modal y se limpia la selección.
      reiniciarSeleccion();
    } catch (e) {
      setError(errorMensaje(e));
    } finally {
      reservaEnCurso.current = false;
      setGuardando(false);
    }
  };
  const reservar = async () => {
    if (!servicioId || !profesionalId || !horario || reservaEnCurso.current) return;
    const seleccion = { servicio_id: servicioId, profesional_id: profesionalId, fecha_hora_inicio: horario };
    const token = sessionStorage.getItem(claveToken);
    if (!token || !clientUser) {
      reservaPendiente.current = seleccion;
      setAuthInitialMode("login");
      setAuthIntent("booking");
      setAuthOpen(true);
      return;
    }
    await confirmarReserva(token, seleccion);
  };
  const autenticarYContinuar = (user: ClientUser) => {
    setClientUser(user);
    setAuthOpen(false);
    const pendiente = reservaPendiente.current;
    const token = sessionStorage.getItem(claveToken);
    if (pendiente && token) {
      void confirmarReserva(token, pendiente);
    } else if (pendiente) {
      setError("La sesión no se guardó correctamente. Volvé a iniciar sesión.");
    } else {
      // Inicio de sesión desde la cabecera: mostrar el formulario desde cero.
      reiniciarSeleccion();
    }
  };
  const obtenerMisTurnos = async () => {
    const token = sessionStorage.getItem(claveToken);
    if (!token) {
      setErrorMisTurnos("Iniciá sesión para consultar tus turnos.");
      setMisTurnos([]);
      return;
    }
    setCargandoMisTurnos(true);
    setErrorMisTurnos("");
    try {
      const respuesta = await apiRequest<TurnoCliente[]>("/turnos/mis-turnos", { token });
      if (!Array.isArray(respuesta)) throw new Error("La respuesta de turnos no tiene el formato esperado.");
      setMisTurnos(respuesta);
    } catch (e) {
      setMisTurnos([]);
      setErrorMisTurnos(errorMensaje(e));
    } finally {
      setCargandoMisTurnos(false);
    }
  };
  const abrirMisTurnos = () => {
    setMenuOpen(false);
    setMisTurnosOpen(true);
    void obtenerMisTurnos();
  };
  const cerrarSesion = () => { setMisTurnosOpen(false); setMisTurnos([]); sessionStorage.removeItem(claveToken); sessionStorage.removeItem(claveUsuario); setClientUser(null); setConfirmado(false); setMenuOpen(false); };

  if (cargando) return <div className="client-app" style={{ padding: 40, textAlign: "center" }}>Cargando centro...</div>;
  if (!centro) return <div className="client-app" style={{ padding: 40, textAlign: "center" }}><h2>Centro no disponible</h2><p>{error || "No encontramos el centro solicitado."}</p></div>;

  return <div className="client-app">
    <header className="topbar">
      <TenantBrand name={centro.nombre} />
      <div className="topbar-account">
        {clientUser ? <div className="user-menu-wrapper">
          <button type="button" className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="user-copy"><strong>Hola, {clientUser.name}</strong><small>Mi cuenta</small></span>
            <span className="avatar avatar-small">{clientUser.initials}</span><Icon name="chevron" size={15} />
          </button>
          {menuOpen && <div className="user-dropdown">
            <button type="button" className="dropdown-item" onClick={abrirMisTurnos}>Mis turnos</button>
            <button type="button" className="dropdown-item danger" onClick={cerrarSesion}>Cerrar sesión</button>
          </div>}
        </div> : <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" className="topbar-login-btn" onClick={() => { setAuthInitialMode("login"); setAuthIntent("login"); setAuthOpen(true); }}>Iniciar sesión</button>
          <button type="button" className="primary-button" style={{ padding: "10px 18px", borderRadius: 999 }} onClick={() => { setAuthInitialMode("register"); setAuthIntent("login"); setAuthOpen(true); }}>Registrarse</button>
        </div>}
      </div>
    </header>
    <main>
      <section className={`hero ${centro.banner_url ? "hero--full-banner" : ""}`}><div className="hero-copy"><span className="eyebrow"><Icon name="sparkle" size={14}/> TU CENTRO DE CONFIANZA</span><h1>{centro.titulo_pagina?.trim() || centro.nombre}</h1><p>{centro.descripcion_pagina?.trim() || "Elegí tu servicio, profesional y horario. Nosotros nos ocupamos del resto."}</p></div><div className="hero-image" role="img" aria-label={`Banner de ${centro.nombre}`} style={centro.banner_url ? { backgroundImage: `url("${new URL(centro.banner_url, API_ORIGEN).href}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} /></section>
      <section className="booking-section">
        <div className="section-heading"><span><small>RESERVA ONLINE</small><h2>Agendá tu próxima visita</h2></span><p>En simples pasos, sin llamadas ni esperas.</p></div>
        {error && <p role="alert" style={{ color: "#b94f3e", marginBottom: 16 }}>{error}</p>}
        <div className="booking-layout"><div className="booking-flow">
          <div className="booking-block"><div className="step-title"><span className="step-number">1</span><span><h3>Elegí un servicio</h3><p>¿Qué te gustaría hacerte?</p></span></div>
            <div className="service-grid">{servicios.map(s => <button type="button" key={s.id} className={`service-card ${servicioId === s.id ? "selected" : ""}`} onClick={() => { setServicioId(s.id); setConfirmado(false); setError(""); }}>
              {servicioId === s.id && <span className="selected-check"><Icon name="check" size={13}/></span>}
              <span className="service-icon"><Icon name={"services" as IconName}/></span><span className="service-info"><strong>{s.nombre}</strong><small>{s.descripcion || "Servicio del centro"}</small></span><span className="service-meta"><strong>{precioArgentina(s.precio)}</strong><small><Icon name="clock" size={13}/> {s.duracion_minutos} min</small></span>
            </button>)}</div>{servicios.length === 0 && <p>Este centro todavía no tiene servicios disponibles.</p>}
          </div>
          {servicioId !== null && <div className="booking-block"><div className="step-title"><span className="step-number">2</span><span><h3>Elegí un profesional</h3><p>Profesionales disponibles para este servicio.</p></span></div>
            <div className="professional-row">{profesionales.map((p,i) => <button type="button" key={p.id} className={`professional-card ${profesionalId === p.id ? "selected" : ""}`} onClick={() => { setProfesionalId(p.id); setError(""); }}>
              <span className={`avatar avatar-${i%3+1}`}>{p.nombre.charAt(0)}{p.apellido.charAt(0)}</span><span><strong>{p.nombre} {p.apellido}</strong><small>{p.especialidad || "Profesional"}</small></span>{profesionalId === p.id && <Icon name="check" size={16}/>}</button>)}</div>
            {cargandoProfesionales ? <p>Cargando profesionales...</p> : servicioId && profesionales.length === 0 && <p>No hay profesionales activos asignados a este servicio.</p>}
          </div>}
          {profesionalId !== null && <div className="booking-block"><div className="step-title"><span className="step-number">3</span><span><h3>Elegí día y horario</h3><p>{profesional ? `Horarios disponibles para ${profesional.nombre}.` : "Primero elegí un profesional."}</p></span></div>
            <div className="date-row">{fechas.map(d => <button type="button" key={d.iso} className={`date-card ${fecha === d.iso ? "selected" : ""}`} onClick={() => { setFecha(d.iso); setError(""); }}><small>{d.dia}</small><strong>{d.numero}</strong><span>{d.mes}</span></button>)}</div>
            <div className="slots">{horarios.map(h => <button type="button" key={h.inicio} className={horario === h.inicio ? "selected" : ""} onClick={() => { setHorario(h.inicio); setConfirmado(false); }}>{horaArgentina(h.inicio)}</button>)}</div>
            {cargandoHorarios ? <p>Consultando disponibilidad...</p> : profesionalId && horarios.length === 0 && <p>No hay horarios disponibles para esta fecha. Probá otro día.</p>}
          </div>}
        </div>
        <aside className="summary-card"><span className="summary-label">RESUMEN DE TU TURNO</span>
          <div className="summary-service"><span className="service-icon large"><Icon name="services" size={24}/></span><span><strong>{servicio?.nombre || "Elegí un servicio"}</strong><small>{servicio?.descripcion || ""}</small></span></div>
          <div className="summary-line"><span><Icon name="user"/> Profesional</span><strong>{profesional ? `${profesional.nombre} ${profesional.apellido}` : "Sin seleccionar"}</strong></div>
          <div className="summary-line"><span><Icon name="calendar"/> Fecha</span><strong>{horario ? fechaVisible(fecha) : "Sin seleccionar"}</strong></div>
          <div className="summary-line"><span><Icon name="clock"/> Horario (Argentina)</span><strong>{horario ? `${horaArgentina(horario)} hs` : "Sin seleccionar"}</strong></div>
          <div className="summary-price"><span>Total</span><strong>{servicio ? precioArgentina(servicio.precio) : "—"}</strong></div>
          <button type="button" className="primary-button" disabled={!horario || guardando || confirmado} onClick={() => void reservar()}>{confirmado ? <><Icon name="check"/> ¡Turno confirmado!</> : guardando ? "Confirmando..." : <>Confirmar turno <Icon name="arrow"/></>}</button>
          {confirmado && <p role="status" style={{ color: "#257a50", marginTop: 12 }}>Tu reserva se guardó correctamente.</p>}
        </aside></div>
      </section>
    </main>
    <footer><div className="footer-powered"><small>Reservas con</small><Brand/></div><span>{centro.direccion || ""}</span><span>© 2026 {centro.nombre}</span></footer>
    {misTurnosOpen && (
      <div className="modal-backdrop" onClick={() => setMisTurnosOpen(false)} style={{ zIndex: 160 }}>
        <section role="dialog" aria-modal="true" aria-labelledby="titulo-mis-turnos"
          onClick={(e) => e.stopPropagation()}
          style={{ width: "min(100%, 590px)", maxHeight: "88vh", overflowY: "auto", background: "#fff",
            borderRadius: 18, padding: "28px 24px", boxShadow: "0 24px 70px rgba(0,0,0,.2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <h2 id="titulo-mis-turnos" style={{ fontSize: 24, color: "#29242b" }}>Mis turnos</h2>
            <button type="button" aria-label="Cerrar mis turnos" onClick={() => setMisTurnosOpen(false)}
              style={{ border: 0, background: "transparent", fontSize: 26, cursor: "pointer", color: "#756e69" }}>×</button>
          </div>
          <p style={{ color: "#716b67", fontSize: 14, marginBottom: 18 }}>Estas son tus reservas en {centro.nombre}.</p>
          {cargandoMisTurnos && <p role="status">Cargando tus turnos...</p>}
          {errorMisTurnos && <p role="alert" style={{ color: "#b94f3e", marginBottom: 16 }}>{errorMisTurnos}</p>}
          {!cargandoMisTurnos && !errorMisTurnos && misTurnos.length === 0 &&
            <p style={{ padding: "22px 12px", textAlign: "center", color: "#716b67" }}>Todavía no tenés turnos registrados en este centro.</p>}
          {!cargandoMisTurnos && !errorMisTurnos && (
            <div style={{ display: "grid", gap: 12 }}>
              {misTurnos.map((turno) => (
                <article key={turno.id} style={{ border: "1px solid #eee2dc", borderRadius: 12, padding: 18, background: "#fffaf8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
                    <strong style={{ color: "#29242b" }}>{turno.servicio?.nombre || "Servicio"}</strong>
                    <span style={{ borderRadius: 20, padding: "5px 10px", background: "#f2e5df", color: "#9a5948", fontSize: 12, fontWeight: 700 }}>
                      {estadoTurno(turno.estado)}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: "#554d48", marginBottom: 6 }}>
                    <strong>Profesional:</strong> {turno.profesional ? `${turno.profesional.nombre} ${turno.profesional.apellido}` : "No disponible"}
                  </p>
                  <p style={{ fontSize: 14, color: "#554d48", marginBottom: 6 }}>
                    <strong>Fecha y hora:</strong> {fechaHoraArgentina(turno.fecha_hora_inicio)} hs
                  </p>
                  {turno.servicio?.duracion_minutos != null &&
                    <p style={{ fontSize: 14, color: "#554d48", marginBottom: 6 }}><strong>Duración:</strong> {turno.servicio.duracion_minutos} min</p>}
                  {turno.servicio?.precio != null &&
                    <p style={{ fontSize: 14, color: "#554d48" }}><strong>Precio:</strong> {precioArgentina(turno.servicio.precio)}</p>}
                </article>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <button type="button" className="table-btn" onClick={() => void obtenerMisTurnos()} disabled={cargandoMisTurnos}>Actualizar</button>
            <button type="button" className="primary-button" onClick={() => setMisTurnosOpen(false)}>Cerrar</button>
          </div>
        </section>
      </div>
    )}
    {reservaConfirmada && (
      <div
        className="modal-backdrop"
        onClick={() => setReservaConfirmada(null)}
        style={{ zIndex: 150 }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-turno-confirmado"
          onClick={(evento) => evento.stopPropagation()}
          style={{
            width: "min(100%, 460px)", maxHeight: "90vh", overflowY: "auto",
            background: "#fff", borderRadius: 18, padding: "30px 26px",
            boxShadow: "0 24px 70px rgba(0,0,0,.20)", position: "relative",
          }}
        >
          <button
            type="button" aria-label="Cerrar confirmación"
            onClick={() => setReservaConfirmada(null)}
            style={{ position: "absolute", right: 16, top: 14, border: 0, background: "transparent", fontSize: 24, cursor: "pointer", color: "#756e69" }}
          >×</button>
          <div style={{ display: "grid", placeItems: "center", marginBottom: 12 }}>
            <span style={{ width: 60, height: 60, display: "grid", placeItems: "center", borderRadius: "50%", background: "#e7f6ed", color: "#26794d" }}>
              <Icon name="check" size={28} />
            </span>
          </div>
          <h2 id="titulo-turno-confirmado" style={{ textAlign: "center", fontSize: 23, marginBottom: 6, color: "#29242b" }}>
            ¡Turno confirmado!
          </h2>
          <p style={{ textAlign: "center", color: "#716b67", fontSize: 14, marginBottom: 22 }}>
            Tu reserva se realizó correctamente.
          </p>
          <div style={{ border: "1px solid #eee2dc", background: "#fffaf8", borderRadius: 12, padding: "8px 18px", marginBottom: 20 }}>
            {([
              ["Centro", reservaConfirmada.centro],
              ["Servicio", reservaConfirmada.servicio],
              ["Profesional", reservaConfirmada.profesional],
              ["Fecha", fechaVisible(new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(reservaConfirmada.fechaHora)))],
              ["Horario", `${horaArgentina(reservaConfirmada.fechaHora)} hs (Argentina)`],
              ["Duración", `${reservaConfirmada.duracion} minutos`],
              ["Precio", precioArgentina(reservaConfirmada.precio)],
              ...(reservaConfirmada.direccion ? [["Dirección", reservaConfirmada.direccion]] : []),
            ] as string[][]).map(([etiqueta, valor]) => (
              <div key={etiqueta} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "12px 0", borderBottom: etiqueta === (reservaConfirmada.direccion ? "Dirección" : "Precio") ? "none" : "1px solid #eee2dc" }}>
                <span style={{ color: "#716b67", fontSize: 13 }}>{etiqueta}</span>
                <strong style={{ textAlign: "right", fontSize: 13, color: "#29242b" }}>{valor}</strong>
              </div>
            ))}
          </div>
          <button type="button" className="primary-button" style={{ width: "100%" }} onClick={() => setReservaConfirmada(null)}>
            Entendido <Icon name="check" />
          </button>
        </section>
      </div>
    )}
    <ClientAuthModal isOpen={authOpen} initialMode={authInitialMode} intent={authIntent} businessId={String(centro.id)} businessName={centro.nombre} onClose={() => { setAuthOpen(false); reservaPendiente.current = null; }} onSuccess={autenticarYContinuar}/>
  </div>;
};
