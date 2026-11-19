// src/modules/owner/OwnerDashboardPage.tsx
import { useEffect, useState, useRef, FormEvent } from "react";
import { Brand } from "../../../components/Brand";
import { Icon, IconName } from "../../../components/Icon";

import { authService } from "../../../services/auth.service";
import { apiRequest } from "../../../services/api";
import { adminCentroService, type ServicioCentro as ServicioCentroAPI, type ProfesionalCentro as ProfesionalCentroAPI } from "../../../services/admin-centro.service";
import { ServiciosCentroSection } from "./ServiciosCentroSection";
import { ProfesionalesCentroSection } from "./ProfesionalesCentroSection";
import { BannerCentroSection } from "./BannerCentroSection";

interface OwnerDashboardViewProps {
  onLogout: () => void;
}

type Section =
  | "Resumen"
  | "Turnos"
  | "Servicios"
  | "Profesionales"
  | "Mi centro"
  | "Mi perfil"
  | "Clientes";

interface AppointmentItem {
  id: number;
  date: string // Formato "YYYY-MM-DD"
  time: string;
  client: string;
  service: string;
  pro: string;
  status: string;
  initials: string;
}

const HOURS_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
];

const ZONA_ARGENTINA = "America/Argentina/Buenos_Aires";

const getTodayISO = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_ARGENTINA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const shiftDateISO = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

const formatDisplayDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const formatHoraArgentina = (fechaISO: string) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: ZONA_ARGENTINA,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(fechaISO));

interface ServiceItem {
  id: number;
  name: string;
  detail: string;
  duration: string;
  price: string;
  icon: IconName;
}

interface ProfessionalItem {
  id: number;
  name: string;
  role: string;
  initials: string;
  days: string[];
  hours: string;
}

interface ClienteCentro {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: string;
  activo: boolean;
}

interface RespuestaClientes {
  status: string;
  data: ClienteCentro[];
}

interface ClienteForm {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
}

const clienteInicial: ClienteForm = {
  nombre: "",
  email: "",
  telefono: "",
  password: "",
};

const ALL_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "US";

export const OwnerDashboardPage = ({ onLogout }: OwnerDashboardViewProps) => {
  const tokenAdminCentro = authService.obtenerTokenAdmin();

  const [active, setActive] = useState<Section>("Resumen");
  const [centerMenuOpen, setCenterMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navegarA = (seccion: Section) => {
    setActive(seccion);
    setMobileMenuOpen(false);
    setCenterMenuOpen(false);
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 841px)");
    const cerrarEnEscritorio = () => { if (media.matches) setMobileMenuOpen(false); };
    cerrarEnEscritorio();
    media.addEventListener("change", cerrarEnEscritorio);
    return () => media.removeEventListener("change", cerrarEnEscritorio);
  }, []);

  // Bloquea el scroll del fondo mientras el menú móvil está abierto.
  useEffect(() => {
    if (!mobileMenuOpen || window.matchMedia("(min-width: 841px)").matches) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = anterior; };
  }, [mobileMenuOpen]);

  // Datos reales del centro y del administrador autenticado.
  const [centerInfo, setCenterInfo] = useState({ name: "", tagline: "", address: "", phone: "" });
  const [profileInfo, setProfileInfo] = useState({ name: "", email: "", role: "Administrador" });
  const [resumenCargando, setResumenCargando] = useState(true);
  const [resumenError, setResumenError] = useState("");
  const [serviciosActivos, setServiciosActivos] = useState(0);
  const [profesionalesActivos, setProfesionalesActivos] = useState(0);
  const [profesionalesFiltro, setProfesionalesFiltro] = useState<{ id: number; name: string }[]>([]);
  const [todayISO, setTodayISO] = useState(getTodayISO);
  const [preciosPorServicio, setPreciosPorServicio] = useState<Record<number, number>>({});
  const [turnosOriginales, setTurnosOriginales] = useState<{
    id: number;
    fecha_hora_inicio: string;
    estado: string;
    servicio_id?: number;
    servicio?: {
      id?: number;
      precio?: number | string;
    };
  }[]>([]);
  useEffect(() => {
    if (!tokenAdminCentro) {
      setResumenError("No se encontró una sesión de administrador.");
      setResumenCargando(false);
      return;
    }
    let vigente = true;
    setResumenCargando(true);
    setResumenError("");
    Promise.all([
      apiRequest<{ status: string; data: { id?: number; nombre: string; slug: string; direccion?: string; telefono?: string } }>("/centros/mi-centro", { token: tokenAdminCentro }),
      apiRequest<{ nombre: string; email: string; rol: string; centro_id: number }>("/auth/perfil", { token: tokenAdminCentro }),
      adminCentroService.listarServicios(tokenAdminCentro),
      adminCentroService.listarProfesionales(tokenAdminCentro),
    ]).then(([centro, usuario, servicios, profesionales]) => {
      if (!vigente) return;
      const partesRuta = window.location.pathname.split("/").filter(Boolean);
      const slugRuta = partesRuta[0] === "centros" && partesRuta[2] === "admin" ? partesRuta[1] : undefined;
      if (slugRuta && decodeURIComponent(slugRuta) !== centro.data.slug) {
        throw new Error("El centro de la sesión no coincide con la URL. Cerrá sesión e ingresá nuevamente.");
      }
      if (typeof (centro.data as { id?: number }).id === "number" && usuario.centro_id !== (centro.data as { id?: number }).id) {
        throw new Error("El usuario autenticado no pertenece al centro de la sesión.");
      }
      setCenterInfo({ name: centro.data.nombre, tagline: "", address: centro.data.direccion ?? "", phone: centro.data.telefono ?? "" });
      setProfileInfo({ name: usuario.nombre, email: usuario.email, role: "Administrador" });
      setServiciosActivos(servicios.filter((item) => item.activo).length);
      setProfesionalesActivos(profesionales.filter((item) => item.activo).length);
      setProfesionalesFiltro(profesionales.filter((item) => item.activo).map((item) => ({ id: item.id, name: [item.nombre, item.apellido].filter(Boolean).join(" ") })));
      setPreciosPorServicio(Object.fromEntries(servicios.map((item) => [item.id, Number(item.precio) || 0])));
    }).catch((error) => {
      if (vigente) setResumenError(error instanceof Error ? error.message : "No se pudo cargar el resumen.");
    }).finally(() => { if (vigente) setResumenCargando(false); });
    return () => { vigente = false; };
  }, [tokenAdminCentro]);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [proFilter, setProFilter] = useState<string>("all");

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);

  const [clientes, setClientes] = useState<ClienteCentro[]>([]);
  const [clientesCargando, setClientesCargando] = useState(false);
  const [clientesError, setClientesError] = useState("");
  const [clientesMensaje, setClientesMensaje] = useState("");
  const [clienteEditar, setClienteEditar] = useState<ClienteCentro | null>(null);
  const [clienteForm, setClienteForm] = useState<ClienteForm>({ ...clienteInicial });
  const [clienteGuardando, setClienteGuardando] = useState(false);
  const [clienteProcesando, setClienteProcesando] = useState<number | null>(null);

  useEffect(() => {
    if (active !== "Clientes" || !tokenAdminCentro) return;
    let vigente = true;
    setClientesCargando(true);
    setClientesError("");
    apiRequest<RespuestaClientes>("/usuarios", {
      method: "GET",
      token: tokenAdminCentro,
    }).then((respuesta) => {
      if (vigente) setClientes(respuesta.data.filter((usuario) => usuario.rol === "CLIENTE"));
    }).catch((error) => {
      if (vigente) setClientesError(error instanceof Error ? error.message : "No se pudieron cargar los clientes.");
    }).finally(() => {
      if (vigente) setClientesCargando(false);
    });
    return () => { vigente = false; };
  }, [active, tokenAdminCentro]);

  const recargarClientes = async () => {
    if (!tokenAdminCentro) return;
    const respuesta = await apiRequest<RespuestaClientes>("/usuarios", {
      method: "GET",
      token: tokenAdminCentro,
    });
    setClientes(respuesta.data.filter((usuario) => usuario.rol === "CLIENTE"));
  };

  const abrirNuevoCliente = () => {
    setClienteEditar(null);
    setClienteForm({ ...clienteInicial });
    setClientesError("");
    setUserModalOpen(true);
  };

  const abrirEditarCliente = (cliente: ClienteCentro) => {
    setClienteEditar(cliente);
    setClienteForm({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono ?? "",
      password: "",
    });
    setClientesError("");
    setUserModalOpen(true);
  };

  const guardarCliente = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!tokenAdminCentro || clienteGuardando) return;
    setClienteGuardando(true);
    setClientesError("");
    setClientesMensaje("");
    try {
      const datos = {
        nombre: clienteForm.nombre.trim(),
        email: clienteForm.email.trim().toLowerCase(),
        telefono: clienteForm.telefono.trim() || null,
        ...(clienteForm.password ? { password: clienteForm.password } : {}),
      };
      if (clienteEditar) {
        await apiRequest(`/usuarios/${clienteEditar.id}`, {
          method: "PUT",
          token: tokenAdminCentro,
          body: JSON.stringify(datos),
        });
      } else {
        if (!clienteForm.password || clienteForm.password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }
        await apiRequest("/usuarios", {
          method: "POST",
          token: tokenAdminCentro,
          body: JSON.stringify(datos),
        });
      }
      await recargarClientes();
      setClientesMensaje(clienteEditar ? "Cliente actualizado correctamente." : "Cliente creado correctamente.");
      setUserModalOpen(false);
    } catch (error) {
      setClientesError(error instanceof Error ? error.message : "No se pudo guardar el cliente.");
    } finally {
      setClienteGuardando(false);
    }
  };

  const cambiarEstadoCliente = async (cliente: ClienteCentro) => {
    if (!tokenAdminCentro || clienteProcesando !== null) return;
    const accion = cliente.activo ? "desactivar" : "activar";
    if (!window.confirm(`¿Querés ${accion} a ${cliente.nombre}?`)) return;
    setClienteProcesando(cliente.id);
    setClientesError("");
    setClientesMensaje("");
    try {
      await apiRequest(`/usuarios/${cliente.id}`, {
        method: "PUT",
        token: tokenAdminCentro,
        body: JSON.stringify({ activo: !cliente.activo }),
      });
      await recargarClientes();
      setClientesMensaje(`Cliente ${cliente.activo ? "desactivado" : "activado"} correctamente.`);
    } catch (error) {
      setClientesError(error instanceof Error ? error.message : "No se pudo cambiar el estado.");
    } finally {
      setClienteProcesando(null);
    }
  };

  // Estados de Modales CRUD
  const [appointmentModal, setAppointmentModal] = useState<AppointmentItem | "new" | null>(null);
  const [serviceModal, setServiceModal] = useState<ServiceItem | "new" | null>(null);
  const [proModal, setProModal] = useState<{ pro: ProfessionalItem | "new"; tab: "datos" | "disponibilidad" } | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const notifySaved = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 2500);
  };

  const nav: [Section, IconName][] = [
    ["Resumen", "grid"],
    ["Turnos", "calendar"],
    ["Servicios", "services"],
    ["Profesionales", "people"],
  ];

  type TurnoAPI = {
    id: number;
    fecha_hora_inicio: string;
    estado: string;
    cliente?: { nombre: string };
    profesional?: { nombre: string; apellido?: string };
    servicio_id?: number;
    servicio?: { id?: number; nombre: string; precio?: number | string };
  };

  const [turnosError, setTurnosError] = useState("");
  const [turnosCargando, setTurnosCargando] = useState(false);
  const [turnoGuardando, setTurnoGuardando] = useState(false);
  const [turnoClientes, setTurnoClientes] = useState<ClienteCentro[]>([]);
  const [turnoServicios, setTurnoServicios] = useState<ServicioCentroAPI[]>([]);
  const [turnoProfesionales, setTurnoProfesionales] = useState<ProfesionalCentroAPI[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const [turnoServicioId, setTurnoServicioId] = useState("");
  const [turnoProfesionalId, setTurnoProfesionalId] = useState("");
  const [turnoFecha, setTurnoFecha] = useState(getTodayISO());
  const [turnoHorario, setTurnoHorario] = useState("");
  const [horariosDisponibles, setHorariosDisponibles] = useState<{ inicio: string; fin: string }[]>([]);
  const [horariosCargando, setHorariosCargando] = useState(false);
  const [horariosError, setHorariosError] = useState("");

  useEffect(() => {
    if (appointmentModal !== "new" || !tokenAdminCentro || !turnoServicioId || !turnoProfesionalId || !turnoFecha) {
      setHorariosDisponibles([]);
      setTurnoHorario("");
      setHorariosError("");
      return;
    }
    let vigente = true;
    setHorariosCargando(true);
    setHorariosError("");
    setHorariosDisponibles([]);
    setTurnoHorario("");
    const params = new URLSearchParams({
      servicio_id: turnoServicioId,
      profesional_id: turnoProfesionalId,
      fecha: turnoFecha,
    });
    apiRequest<{ horarios: { inicio: string; fin: string }[] }>(`/turnos/disponibles?${params.toString()}`, {
      method: "GET", token: tokenAdminCentro,
    }).then((resultado) => {
      if (vigente) setHorariosDisponibles(resultado.horarios ?? []);
    }).catch((error) => {
      if (vigente) setHorariosError(error instanceof Error ? error.message : "No se pudieron consultar los horarios.");
    }).finally(() => {
      if (vigente) setHorariosCargando(false);
    });
    return () => { vigente = false; };
  }, [appointmentModal, tokenAdminCentro, turnoServicioId, turnoProfesionalId, turnoFecha]);

  // Un solo normalizador para la carga inicial, polling y cambios locales.
  type RespuestaTurnos = TurnoAPI[] | { data: TurnoAPI[] };
  const normalizarTurnos = (respuesta: RespuestaTurnos): TurnoAPI[] => {
    const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data;
    if (!Array.isArray(lista)) throw new Error("La respuesta de turnos no tiene el formato esperado.");
    return lista;
  };

  const esTurnoActivo = (turno: TurnoAPI) =>
    !String(turno.estado ?? "").trim().toLowerCase().startsWith("cancel");

  const convertirTurno = (turno: TurnoAPI): AppointmentItem => {
    const fecha = new Date(turno.fecha_hora_inicio);
    if (Number.isNaN(fecha.getTime())) throw new Error("Un turno tiene una fecha inválida.");
    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONA_ARGENTINA,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(fecha);
    const parte = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
    const nombre = turno.cliente?.nombre ?? "Cliente sin datos";
    return {
      id: turno.id,
      date: `${parte("year")}-${parte("month")}-${parte("day")}`,
      time: `${parte("hour")}:${parte("minute")}`,
      client: nombre,
      service: turno.servicio?.nombre ?? "—",
      pro: [turno.profesional?.nombre, turno.profesional?.apellido].filter(Boolean).join(" ") || "—",
      status: turno.estado,
      initials: getInitials(nombre),
    };
  };

  // Evita que una respuesta anterior pise una actualización más reciente.
  const versionTurnos = useRef(0);
  const consultaEnCurso = useRef(false);
  const cargarTurnos = async () => {
    if (!tokenAdminCentro) return;
    const version = ++versionTurnos.current;
    const respuesta = await apiRequest<RespuestaTurnos>("/turnos", { method: "GET", token: tokenAdminCentro });
    const lista = normalizarTurnos(respuesta);
    const visibles = lista.filter(esTurnoActivo).map(convertirTurno);
    if (version !== versionTurnos.current) return;
    setTurnosOriginales(lista);
    setAppointments(visibles);
    setTurnosError("");
  };

  // Actualización silenciosa: no limpia datos existentes, formularios ni filtros.
  useEffect(() => {
    if (!tokenAdminCentro) {
      setTurnosCargando(false);
      setTurnosError("No se encontró una sesión de administrador.");
      return;
    }
    let vigente = true;
    const actualizar = async () => {
      if (!vigente || document.visibilityState === "hidden" || consultaEnCurso.current) return;
      consultaEnCurso.current = true;
      try {
        await cargarTurnos();
      } catch (error) {
        if (vigente) setTurnosError(error instanceof Error ? error.message : "No se pudo actualizar la agenda.");
      } finally {
        consultaEnCurso.current = false;
        if (vigente) setTurnosCargando(false);
      }
    };
    setTurnosCargando(true);
    void actualizar();
    const intervalo = window.setInterval(() => { void actualizar(); }, 10000);
    const alVolver = () => { if (document.visibilityState === "visible") void actualizar(); };
    window.addEventListener("focus", alVolver);
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      vigente = false;
      // Invalida respuestas de la instancia desmontada (incluye React StrictMode).
      versionTurnos.current++;
      consultaEnCurso.current = false;
      window.clearInterval(intervalo);
      window.removeEventListener("focus", alVolver);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [tokenAdminCentro]);

  // Estadísticas y filtros actualizados también cuando cambian servicios o profesionales.
  useEffect(() => {
    if (!tokenAdminCentro) return;
    let vigente = true;
    let enCurso = false;
    const actualizarCatalogo = async () => {
      if (!vigente || enCurso || document.visibilityState === "hidden") return;
      enCurso = true;
      try {
        const [servicios, profesionales] = await Promise.all([
          adminCentroService.listarServicios(tokenAdminCentro),
          adminCentroService.listarProfesionales(tokenAdminCentro),
        ]);
        if (!vigente) return;
        setServiciosActivos(servicios.filter((item) => item.activo).length);
        setProfesionalesActivos(profesionales.filter((item) => item.activo).length);
        setProfesionalesFiltro(profesionales.filter((item) => item.activo).map((item) => ({
          id: item.id, name: [item.nombre, item.apellido].filter(Boolean).join(" "),
        })));
        setPreciosPorServicio(Object.fromEntries(servicios.map((item) => [item.id, Number(item.precio) || 0])));
      } catch (error) {
        // La carga inicial muestra errores; un fallo temporal de polling conserva los datos anteriores.
        console.error("No se pudieron actualizar las estadísticas del centro:", error);
      } finally { enCurso = false; }
    };
    const actualizarAlVolver = () => { if (document.visibilityState === "visible") void actualizarCatalogo(); };
    const intervalo = window.setInterval(() => { void actualizarCatalogo(); }, 10000);
    window.addEventListener("focus", actualizarAlVolver);
    document.addEventListener("visibilitychange", actualizarAlVolver);
    return () => {
      vigente = false;
      window.clearInterval(intervalo);
      window.removeEventListener("focus", actualizarAlVolver);
      document.removeEventListener("visibilitychange", actualizarAlVolver);
    };
  }, [tokenAdminCentro]);

  // El cambio de día en Argentina se refleja sin necesidad de recargar la página.
  useEffect(() => {
    const intervalo = window.setInterval(() => setTodayISO(getTodayISO()), 30000);
    return () => window.clearInterval(intervalo);
  }, []);

  const abrirNuevoTurno = async () => {
    if (!tokenAdminCentro) return;
    setTurnosError("");
    setBusquedaCliente("");
    setClienteSeleccionado(null);
    setTurnoServicioId("");
    setTurnoProfesionalId("");
    setTurnoFecha(getTodayISO());
    setTurnoHorario("");
    try {
      const [usuarios, serviciosCentro, profesionalesCentro] = await Promise.all([
        apiRequest<RespuestaClientes>("/usuarios", { method: "GET", token: tokenAdminCentro }),
        adminCentroService.listarServicios(tokenAdminCentro),
        adminCentroService.listarProfesionales(tokenAdminCentro),
      ]);
      setTurnoClientes(usuarios.data.filter((u) => u.rol === "CLIENTE" && u.activo));
      setTurnoServicios(serviciosCentro.filter((servicio) => servicio.activo));
      setTurnoProfesionales(profesionalesCentro.filter((profesional) => profesional.activo));
      setAppointmentModal("new");
    } catch (error) {
      setTurnosError(error instanceof Error ? error.message : "No se pudo preparar el formulario.");
    }
  };

  const guardarTurnoReal = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!tokenAdminCentro || turnoGuardando) return;
    if (!clienteSeleccionado) {
      setTurnosError("Seleccioná un cliente de los resultados de búsqueda.");
      return;
    }
    const hora = turnoHorario;
    if (!turnoFecha || !hora || !turnoServicioId || !turnoProfesionalId) {
      setTurnosError("Completá la fecha, el horario, el servicio y el profesional.");
      return;
    }
    if (!horariosDisponibles.some((h) => h.inicio === hora)) {
      setTurnosError("Seleccioná un horario disponible de la lista.");
      return;
    }
    setTurnoGuardando(true);
    setTurnosError("");
    try {
      await apiRequest("/turnos", {
        method: "POST",
        token: tokenAdminCentro,
        body: JSON.stringify({
          cliente_id: clienteSeleccionado,
          servicio_id: Number(turnoServicioId),
          profesional_id: Number(turnoProfesionalId),
          fecha_hora_inicio: hora,
        }),
      });
      await cargarTurnos();
      setAppointmentModal(null);
      notifySaved("Turno creado correctamente.");
    } catch (error) {
      setTurnosError(error instanceof Error ? error.message : "No se pudo crear el turno.");
    } finally {
      setTurnoGuardando(false);
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!tokenAdminCentro || !window.confirm("¿Querés cancelar este turno?")) return;
    setTurnosError("");
    try {
      await apiRequest(`/turnos/${id}`, { method: "DELETE", token: tokenAdminCentro });
      setAppointments((actuales) => actuales.filter((turno) => turno.id !== id));
      setTurnosOriginales((actuales) => actuales.filter((turno) => turno.id !== id));
      await cargarTurnos();
      notifySaved("Turno cancelado correctamente.");
    } catch (error) {
      setTurnosError(error instanceof Error ? error.message : "No se pudo cancelar el turno.");
    }
  };

  // --- Handlers CRUD ---
  const handleSaveService = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rawPrice = String(fd.get("price") || "$0");
    const formattedPrice = rawPrice.startsWith("$") ? rawPrice : `$${rawPrice}`;

    const payload: Omit<ServiceItem, "id"> = {
      name: String(fd.get("name") || ""),
      detail: String(fd.get("detail") || ""),
      duration: String(fd.get("duration") || "45 min"),
      price: formattedPrice,
      icon: (fd.get("icon") as IconName) || "sparkle",
    };

    if (serviceModal === "new") {
      setServices((prev) => [...prev, { id: Date.now(), ...payload }]);
    } else if (serviceModal) {
      setServices((prev) =>
        prev.map((s) => (s.id === serviceModal.id ? { ...s, ...payload } : s))
      );
    }
    setServiceModal(null);
  };

  const handleDeleteService = (id: number) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveProfessional = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "");
    const selectedDays = ALL_DAYS.filter((day) => fd.get(`day_${day}`) === "on");

    const payload: Omit<ProfessionalItem, "id"> = {
      name,
      role: String(fd.get("role") || ""),
      initials: getInitials(name),
      days: selectedDays.length > 0 ? selectedDays : ["Lun", "Mar", "Mié", "Jue", "Vie"],
      hours: String(fd.get("hours") || "09:00 - 17:00"),
    };

    if (proModal?.pro === "new") {
      setProfessionals((prev) => [...prev, { id: Date.now(), ...payload }]);
    } else if (proModal?.pro) {
      const targetId = proModal.pro.id;
      setProfessionals((prev) =>
        prev.map((p) => (p.id === targetId ? { ...p, ...payload } : p))
      );
    }
    setProModal(null);
  };

  const handleDeleteProfessional = (id: number) => {
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
  };

  const turnosHoy = appointments.filter((a) => a.date === todayISO && !["cancelado", "cancelada"].includes(a.status.toLowerCase()));
  const pendingCount = turnosHoy.filter((a) => ["pendiente", "reservado"].includes(a.status.toLowerCase())).length;
  const ingresosHoy = turnosOriginales.filter((turno) => {
    const fecha = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_ARGENTINA, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(turno.fecha_hora_inicio));
    return fecha === todayISO && !["cancelado", "cancelada"].includes(turno.estado.toLowerCase());
  }).reduce((total, turno) => total + (Number(turno.servicio?.precio) || preciosPorServicio[turno.servicio_id ?? turno.servicio?.id ?? -1] || 0), 0);
  const dayAppointments = appointments.filter(
    (a) =>
      a.date === selectedDate &&
      (proFilter === "all" || a.pro === proFilter)
  );

  return (
    <div className="admin-app">
      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside id="admin-sidebar" className={`sidebar${mobileMenuOpen ? " sidebar-mobile-open" : ""}`}>
        <button
          type="button"
          className="admin-mobile-close"
          aria-label="Cerrar menú"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span aria-hidden="true">×</span>
        </button>
        <Brand />

        {/* Tarjeta del centro activo con desplegable hacia "Mi centro" */}
        <div className="center-switch-wrapper">
          <button
            type="button"
            className="center-switch"
            onClick={() => setCenterMenuOpen((prev) => !prev)}
          >
            <span className="center-logo">{getInitials(centerInfo.name)}</span>
            <span>
              <strong>{centerInfo.name}</strong>
              <small>Centro activo</small>
            </span>
            <Icon name="chevron" size={15} />
          </button>

          {centerMenuOpen && (
            <div className="center-dropdown">
              <button
                type="button"
                onClick={() => {
                  navegarA("Mi centro");
                }}
              >
                <Icon name="home" size={15} />
                <span>Configurar mi centro</span>
              </button>
            </div>
          )}
        </div>

        <nav className="side-nav">
          <small>GESTIÓN</small>
          {nav.map(([label, icon]) => (
            <button
              key={label}
              onClick={() => navegarA(label)}
              className={active === label ? "active" : ""}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === "Turnos" && <b>{appointments.length}</b>}
            </button>
          ))}

          <small>CONFIGURACIÓN</small>
          <button
            onClick={() => navegarA("Mi perfil")}
            className={active === "Mi perfil" ? "active" : ""}
          >
            <Icon name="settings" />
            <span>Mi perfil</span>
          </button>
          <button
            onClick={() => navegarA("Clientes")}
            className={active === "Clientes" ? "active" : ""}
          >
            <Icon name="user" />
            <span>Clientes</span>
          </button>
        </nav>

        <button className="logout-button" onClick={onLogout}>
          <Icon name="logout" />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="mobile-menu"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-sidebar"
            onClick={() => setMobileMenuOpen((abierto) => !abierto)}
          >
            <Icon name="menu" />
          </button>
          <span>
            <h1>{active}</h1>
            <p style={{ textTransform: "capitalize" }}>{formatDisplayDate(todayISO)}</p>
          </span>
          <div className="admin-profile">
            <span>
              <strong>{profileInfo.name}</strong>
              <small>{profileInfo.role}</small>
            </span>
            <span className="avatar avatar-small">{getInitials(profileInfo.name)}</span>
          </div>
        </header>

        <div className="admin-content">
          {savedBanner && <div className="admin-toast">{savedBanner}</div>}

          {/* ==================== 1. RESUMEN (Dashboard) ==================== */}
          {active === "Resumen" && (
            <>
              {resumenCargando && <p role="status">Cargando información real del centro...</p>}
              {resumenError && <p role="alert" style={{ color: "#bd4b3b" }}>{resumenError}</p>}
              {!resumenCargando && !resumenError && <section className="welcome">
                <span>
                  <h2>Buen día, {profileInfo.name.split(" ")[0]}.</h2>
                  <p>Esto es lo que está pasando hoy en {centerInfo.name}.</p>
                </span>
              </section>}

              {!resumenCargando && !resumenError && <section className="metrics">
                <article>
                  <span className="metric-icon coral">
                    <Icon name="calendar" />
                  </span>
                  <span>
                    <small>TURNOS DE HOY</small>
                    <strong>{turnosHoy.length}</strong>
                    <em>{pendingCount} pendientes</em>
                  </span>
                </article>
                <article>
                  <span className="metric-icon green">
                    <Icon name="check" />
                  </span>
                  <span>
                    <small>SERVICIOS ACTIVOS</small>
                    <strong>{serviciosActivos}</strong>
                    <em>Catálogo disponible</em>
                  </span>
                </article>
                <article>
                  <span className="metric-icon ochre">
                    <Icon name="services" />
                  </span>
                  <span>
                    <small>INGRESOS ESTIMADOS</small>
                    <strong>{ingresosHoy.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}</strong>
                    <em>Agenda del día</em>
                  </span>
                </article>
                <article>
                  <span className="metric-icon mauve">
                    <Icon name="people" />
                  </span>
                  <span>
                    <small>PROFESIONALES</small>
                    <strong>{profesionalesActivos}</strong>
                    <em>Activos en agenda</em>
                  </span>
                </article>
              </section>}

              <section className="panel daily-calendar">
                <div className="daily-calendar-header">
                  <div className="daily-nav-group">
                    <button
                      type="button"
                      className="cal-nav-btn"
                      onClick={() => setSelectedDate((d) => shiftDateISO(d, -1))}
                      title="Día anterior"
                    >
                      <Icon name="chevron" size={16} />
                    </button>

                    <div className="daily-date-title">
                      <strong style={{ textTransform: "capitalize" }}>
                        {formatDisplayDate(selectedDate)}
                      </strong>
                      {selectedDate === todayISO && (
                        <span className="today-pill">Hoy</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="cal-nav-btn next"
                      onClick={() => setSelectedDate((d) => shiftDateISO(d, 1))}
                      title="Día siguiente"
                    >
                      <Icon name="chevron" size={16} />
                    </button>

                    {selectedDate !== todayISO && (
                      <button
                        type="button"
                        className="table-btn"
                        onClick={() => setSelectedDate(todayISO)}
                      >
                        Volver a hoy
                      </button>
                    )}
                  </div>

                  <div className="daily-controls-group">
                    <select
                      className="cal-filter-select"
                      value={proFilter}
                      onChange={(e) => setProFilter(e.target.value)}
                    >
                      <option value="all">Todos los profesionales</option>
                      {profesionalesFiltro.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      className="cal-date-picker"
                      value={selectedDate}
                      onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                      aria-label="Elegir fecha"
                    />
                  </div>
                </div>

                <div className="daily-timeline">
                  {HOURS_SLOTS.map((slot) => {
                    const slotHour = slot.slice(0, 2);
                    const slotItems = dayAppointments.filter((a) =>
                      a.time.startsWith(slotHour)
                    );

                    return (
                      <div className="timeline-row" key={slot}>
                        <span className="timeline-hour">{slot}</span>

                        <div className="timeline-track">
                          {slotItems.length === 0 ? (
                            <span className="timeline-empty">—</span>
                          ) : (
                            slotItems.map((appt) => (
                              <div
                                key={appt.id}
                                className={`timeline-event ${appt.status === "Pendiente" ? "pending" : ""
                                  }`}
                              >
                                <div className="timeline-event-top">
                                  <strong>{appt.service}</strong>
                                  <span>{appt.time}</span>
                                </div>
                                <small>
                                  {appt.pro} · {appt.client}
                                </small>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* ==================== 2. TURNOS ==================== */}
          {active === "Turnos" && (
            <>
              <section className="welcome">
                <span>
                  <h2>Agenda de turnos</h2>
                  <p>Administrá las reservas programadas de hoy y próximos días.</p>
                </span>
                <button className="primary-button" onClick={() => void abrirNuevoTurno()}>
                  <Icon name="plus" /> Nuevo turno
                </button>
              </section>

              {turnosError && <p role="alert" style={{ color: "#bd4b3b" }}>{turnosError}</p>}
              {turnosCargando && appointments.length === 0 && <p role="status">Cargando agenda...</p>}
              <section className="panel">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Servicio</th>
                        <th>Profesional</th>
                        <th>Estado</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.time}</strong></td>
                          <td>
                            <div className="table-entity">
                              <span className="avatar avatar-list">{item.initials}</span>
                              <strong>{item.client}</strong>
                            </div>
                          </td>
                          <td>{item.service}</td>
                          <td>{item.pro}</td>
                          <td>
                            <span className={`status ${item.status === "Pendiente" ? "pending" : ""}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="table-actions">
                              <button
                                className="table-btn"
                                onClick={() => setTurnosError("La edición de turnos por ADMIN_CENTRO todavía no está disponible en el backend. Podés cancelar y crear otro turno.")}
                              >
                                Editar
                              </button>
                              <button
                                className="table-btn danger"
                                onClick={() => void handleDeleteAppointment(item.id)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* ==================== 3. SERVICIOS REALES ==================== */}
          {active === "Servicios" && (
            tokenAdminCentro ? (
              <ServiciosCentroSection token={tokenAdminCentro} />
            ) : (
              <section className="panel" role="alert">
                <p>No se encontró la sesión del administrador. Volvé a iniciar sesión.</p>
              </section>
            )
          )}

          {/* ==================== 4. PROFESIONALES REALES ==================== */}
          {active === "Profesionales" && (
            tokenAdminCentro ? (
              <ProfesionalesCentroSection token={tokenAdminCentro} />
            ) : (
              <section className="panel" role="alert">
                <p>No se encontró la sesión del administrador. Volvé a iniciar sesión.</p>
              </section>
            )
          )}

          {/* ==================== 5. MI CENTRO (desde flecha superior) ==================== */}
          {active === "Mi centro" && (
            <>
              <section className="welcome">
                <span>
                  <h2>Configuración del centro</h2>
                  <p>Información pública que verán tus clientes al reservar.</p>
                </span>
              </section>

              <section className="panel admin-form-panel">
                <form
                  className="admin-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    notifySaved("Datos del centro actualizados.");
                  }}
                >
                  <div className="form-grid-2">
                    <label>
                      <span>Nombre del centro</span>
                      <input
                        value={centerInfo.name}
                        onChange={(e) => setCenterInfo({ ...centerInfo, name: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      <span>Rubro / Eslogan</span>
                      <input
                        value={centerInfo.tagline}
                        onChange={(e) => setCenterInfo({ ...centerInfo, tagline: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Dirección</span>
                      <input
                        value={centerInfo.address}
                        onChange={(e) => setCenterInfo({ ...centerInfo, address: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Teléfono de contacto</span>
                      <input
                        value={centerInfo.phone}
                        onChange={(e) => setCenterInfo({ ...centerInfo, phone: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="form-footer">
                    <button type="submit" className="primary-button">
                      Guardar cambios
                    </button>
                  </div>
                </form>
              </section>
              {tokenAdminCentro && <BannerCentroSection token={tokenAdminCentro} />}
            </>
          )}

          {/* ==================== 6. MI PERFIL (tuerca) ==================== */}
          {active === "Mi perfil" && (
            <>
              <section className="welcome">
                <span>
                  <h2>Mi perfil</h2>
                  <p>Editá tus datos personales y credenciales de acceso.</p>
                </span>
              </section>

              <section className="panel admin-form-panel">
                <form
                  className="admin-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    notifySaved("Perfil actualizado correctamente.");
                  }}
                >
                  <div className="form-grid-2">
                    <label>
                      <span>Nombre completo</span>
                      <input
                        value={profileInfo.name}
                        onChange={(e) => setProfileInfo({ ...profileInfo, name: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      <span>Correo electrónico</span>
                      <input
                        type="email"
                        value={profileInfo.email}
                        onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      <span>Nueva contraseña (opcional)</span>
                      <input type="password" placeholder="••••••••" />
                    </label>
                    <label>
                      <span>Confirmar contraseña</span>
                      <input type="password" placeholder="••••••••" />
                    </label>
                  </div>
                  <div className="form-footer">
                    <button type="submit" className="primary-button">
                      Actualizar perfil
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}

          {/* ==================== 7. CLIENTES ==================== */}
          {active === "Clientes" && (
            <>
              <section className="welcome">
                <span><h2>Clientes del centro</h2><p>Gestioná los clientes registrados en tu centro.</p></span>
                <button type="button" className="primary-button" onClick={abrirNuevoCliente}><Icon name="plus" /> Nuevo cliente</button>
              </section>
              {clientesMensaje && <div className="admin-toast" role="status">{clientesMensaje}</div>}
              {clientesError && <p role="alert" style={{ color: "#bd4b3b" }}>{clientesError}</p>}
              <section className="panel">
                {!tokenAdminCentro ? <p>Volvé a iniciar sesión.</p> : clientesCargando ? <p>Cargando clientes...</p> : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Cliente</th><th>Email</th><th>Teléfono</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                      <tbody>{clientes.map((cliente) => (
                        <tr key={cliente.id}>
                          <td><div className="table-entity"><span className="avatar avatar-list">{getInitials(cliente.nombre)}</span><strong>{cliente.nombre}</strong></div></td>
                          <td>{cliente.email}</td><td>{cliente.telefono || "—"}</td>
                          <td><span className={`status ${cliente.activo ? "" : "pending"}`}>{cliente.activo ? "Activo" : "Inactivo"}</span></td>
                          <td className="text-right"><div className="table-actions">
                            <button type="button" className="table-btn" onClick={() => abrirEditarCliente(cliente)}>Editar</button>
                            <button type="button" className={cliente.activo ? "table-btn danger" : "table-btn"} disabled={clienteProcesando !== null} onClick={() => cambiarEstadoCliente(cliente)}>
                              {clienteProcesando === cliente.id ? "Procesando..." : cliente.activo ? "Desactivar" : "Activar"}
                            </button>
                          </div></td>
                        </tr>
                      ))}</tbody>
                    </table>
                    {clientes.length === 0 && <p>No hay clientes registrados en este centro.</p>}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* ==================== MODALES DE CREACIÓN / EDICIÓN ==================== */}
      {appointmentModal === "new" && (
        <div className="admin-modal-backdrop" onClick={() => !turnoGuardando && setAppointmentModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nuevo turno</h3>
            {turnosError && <p role="alert" style={{ color: "#bd4b3b" }}>{turnosError}</p>}
            <form onSubmit={guardarTurnoReal} className="admin-form">
              <label>
                <span>Buscar cliente por nombre</span>
                <input
                  type="search"
                  value={busquedaCliente}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setClienteSeleccionado(null);
                  }}
                  placeholder="Escribí el nombre del cliente..."
                  autoComplete="off"
                  required
                />
              </label>
              {busquedaCliente.trim() && clienteSeleccionado === null && (
                <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid #e9dfd8", borderRadius: 10, marginTop: -8, marginBottom: 12 }}>
                  {turnoClientes.filter((cliente) =>
                    cliente.nombre.toLocaleLowerCase("es-AR").includes(busquedaCliente.trim().toLocaleLowerCase("es-AR"))
                  ).slice(0, 12).map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => {
                        setClienteSeleccionado(cliente.id);
                        setBusquedaCliente(cliente.nombre);
                      }}
                      style={{ display: "block", width: "100%", padding: 10, border: 0, borderBottom: "1px solid #eee", background: "#fff", textAlign: "left", cursor: "pointer" }}
                    >
                      <strong>{cliente.nombre}</strong>
                      <small style={{ display: "block", color: "#777" }}>{cliente.email}</small>
                    </button>
                  ))}
                  {!turnoClientes.some((cliente) => cliente.nombre.toLocaleLowerCase("es-AR").includes(busquedaCliente.trim().toLocaleLowerCase("es-AR"))) && (
                    <p style={{ padding: 10 }}>No hay coincidencias. Registrá primero al cliente en Clientes.</p>
                  )}
                </div>
              )}
              {clienteSeleccionado !== null && <p style={{ color: "#41805c", fontSize: 13 }}>✓ Cliente seleccionado</p>}
              <div className="form-grid-2">
                <label>
                  <span>Fecha</span>
                  <input type="date" name="date" value={turnoFecha} onChange={(e) => setTurnoFecha(e.target.value)} min={getTodayISO()} required />
                </label>
                <label>
                  <span>Horario</span>
                  <select name="time" value={turnoHorario} onChange={(e) => setTurnoHorario(e.target.value)} disabled={!turnoServicioId || !turnoProfesionalId || horariosCargando || horariosDisponibles.length === 0} required>
                    <option value="">{horariosCargando ? "Consultando horarios..." : !turnoServicioId || !turnoProfesionalId ? "Elegí servicio y profesional" : horariosDisponibles.length === 0 ? "No hay horarios disponibles" : "Seleccioná un horario"}</option>
                    {horariosDisponibles.map((horario) => (
                      <option key={horario.inicio} value={horario.inicio}>
                        {formatHoraArgentina(horario.inicio)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {horariosError && <p role="alert" style={{ color: "#bd4b3b" }}>{horariosError}</p>}
              <label>
                <span>Servicio</span>
                <select
                  value={turnoServicioId}
                  onChange={(e) => {
                    setTurnoServicioId(e.target.value);
                    setTurnoProfesionalId("");
                  }}
                  required
                >
                  <option value="">Seleccioná un servicio</option>
                  {turnoServicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Profesional</span>
                <select value={turnoProfesionalId} onChange={(e) => setTurnoProfesionalId(e.target.value)} required>
                  <option value="">Seleccioná un profesional</option>
                  {turnoProfesionales
                    .filter((profesional) => !turnoServicioId || profesional.servicios?.some((servicio) => servicio.id === Number(turnoServicioId)))
                    .map((profesional) => (
                      <option key={profesional.id} value={profesional.id}>
                        {profesional.nombre} {profesional.apellido}
                      </option>
                    ))}
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="table-btn" disabled={turnoGuardando} onClick={() => setAppointmentModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button" disabled={turnoGuardando}>
                  {turnoGuardando ? "Guardando..." : "Crear turno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {serviceModal && (
        <div className="admin-modal-backdrop" onClick={() => setServiceModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{serviceModal === "new" ? "Nuevo servicio" : "Editar servicio"}</h3>
            <form onSubmit={handleSaveService} className="admin-form">
              <label>
                <span>Nombre del servicio</span>
                <input
                  name="name"
                  defaultValue={serviceModal === "new" ? "" : serviceModal.name}
                  placeholder="Ej. Limpieza facial"
                  required
                />
              </label>
              <label>
                <span>Descripción corta</span>
                <input
                  name="detail"
                  defaultValue={serviceModal === "new" ? "" : serviceModal.detail}
                  placeholder="Ej. Renovación profunda"
                  required
                />
              </label>
              <div className="form-grid-2">
                <label>
                  <span>Duración</span>
                  <input
                    name="duration"
                    defaultValue={serviceModal === "new" ? "45 min" : serviceModal.duration}
                    required
                  />
                </label>
                <label>
                  <span>Precio</span>
                  <input
                    name="price"
                    defaultValue={serviceModal === "new" ? "$20.000" : serviceModal.price}
                    required
                  />
                </label>
              </div>
              <label>
                <span>Ícono</span>
                <select
                  name="icon"
                  defaultValue={serviceModal === "new" ? "sparkle" : serviceModal.icon}
                >
                  <option value="sparkle">Estrella / Estética</option>
                  <option value="services">Capas / Bienestar</option>
                  <option value="scissors">Tijeras / Peluquería</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="table-btn" onClick={() => setServiceModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Guardar servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {proModal && (
        <div className="admin-modal-backdrop" onClick={() => setProModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {proModal.pro === "new"
                ? "Nuevo profesional"
                : proModal.tab === "disponibilidad"
                  ? `Disponibilidad — ${proModal.pro.name}`
                  : "Editar profesional"}
            </h3>
            <form onSubmit={handleSaveProfessional} className="admin-form">
              <div className="form-grid-2">
                <label>
                  <span>Nombre y apellido</span>
                  <input
                    name="name"
                    defaultValue={proModal.pro === "new" ? "" : proModal.pro.name}
                    placeholder="Ej. Sofía Méndez"
                    required
                  />
                </label>
                <label>
                  <span>Especialidad / Rol</span>
                  <input
                    name="role"
                    defaultValue={proModal.pro === "new" ? "" : proModal.pro.role}
                    placeholder="Ej. Cosmetóloga"
                    required
                  />
                </label>
              </div>

              <label>
                <span>Días de atención</span>
                <div className="days-selector">
                  {ALL_DAYS.map((day) => {
                    const checked =
                      proModal.pro === "new"
                        ? ["Lun", "Mar", "Mié", "Jue", "Vie"].includes(day)
                        : proModal.pro.days.includes(day);
                    return (
                      <label key={day} className="day-check">
                        <input type="checkbox" name={`day_${day}`} defaultChecked={checked} />
                        <span>{day}</span>
                      </label>
                    );
                  })}
                </div>
              </label>

              <label>
                <span>Franja horaria</span>
                <input
                  name="hours"
                  defaultValue={proModal.pro === "new" ? "09:00 - 17:00" : proModal.pro.hours}
                  placeholder="09:00 - 17:00"
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="table-btn" onClick={() => setProModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Guardar profesional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !clienteGuardando && setUserModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{clienteEditar ? "Editar cliente" : "Nuevo cliente"}</h3>
            {clientesError && <p role="alert" style={{ color: "#bd4b3b" }}>{clientesError}</p>}
            <form onSubmit={guardarCliente} className="admin-form">
              <label><span>Nombre completo</span><input value={clienteForm.nombre} onChange={(e) => setClienteForm((prev) => ({ ...prev, nombre: e.target.value }))} minLength={3} required /></label>
              <label><span>Correo electrónico</span><input type="email" value={clienteForm.email} onChange={(e) => setClienteForm((prev) => ({ ...prev, email: e.target.value }))} required /></label>
              <label><span>Teléfono (opcional)</span><input type="tel" value={clienteForm.telefono} onChange={(e) => setClienteForm((prev) => ({ ...prev, telefono: e.target.value }))} /></label>
              <label><span>{clienteEditar ? "Nueva contraseña (opcional)" : "Contraseña"}</span><input type="password" value={clienteForm.password} onChange={(e) => setClienteForm((prev) => ({ ...prev, password: e.target.value }))} minLength={6} required={!clienteEditar} /></label>
              <div className="modal-actions">
                <button type="button" className="table-btn" disabled={clienteGuardando} onClick={() => setUserModalOpen(false)}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={clienteGuardando}>{clienteGuardando ? "Guardando..." : clienteEditar ? "Guardar cambios" : "Crear cliente"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};