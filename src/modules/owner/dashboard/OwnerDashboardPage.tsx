// src/modules/owner/OwnerDashboardPage.tsx
import { useState, FormEvent } from "react";
import { Brand } from "../../../components/Brand";
import { Icon, IconName } from "../../../components/Icon";
import { appointments as initialAppointments } from "@/data/mockAppointments";
import { MOCK_ALMAESTETICA } from "@/data/mockBusiness";

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
  | "Usuarios";

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

const getTodayISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

const shiftDateISO = (isoDate: string, days: number) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const formatDisplayDate = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

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

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: "Administradora" | "Recepción";
  active: boolean;
}

const ALL_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "US";

export const OwnerDashboardPage = ({ onLogout }: OwnerDashboardViewProps) => {
  const initialBiz = MOCK_ALMAESTETICA[0];

  const [active, setActive] = useState<Section>("Resumen");
  const [centerMenuOpen, setCenterMenuOpen] = useState(false);

  // Estados principales (listos para reemplazar por fetch/API)
  const [centerInfo, setCenterInfo] = useState({
    name: initialBiz.name,
    tagline: initialBiz.tagline,
    address: initialBiz.address,
    phone: "+54 11 4823-9100",
  });

  const [profileInfo, setProfileInfo] = useState({
    name: "María González",
    email: "maria@almaestetica.com",
    role: "Administradora",
  });

  const todayISO = getTodayISO();
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [proFilter, setProFilter] = useState<string>("all");

  const [appointments, setAppointments] = useState<AppointmentItem[]>(
    initialAppointments.map((item) => ({
      ...item,
      date: todayISO,
    }))
  );

  const [services, setServices] = useState<ServiceItem[]>(initialBiz.services);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>(
    initialBiz.professionals.map((pro, idx) => ({
      ...pro,
      days: idx === 1 ? ["Mar", "Mié", "Jue", "Vie", "Sáb"] : ["Lun", "Mar", "Mié", "Jue", "Vie"],
      hours: idx === 2 ? "10:00 - 18:00" : "09:00 - 17:00",
    }))
  );

  const [users, setUsers] = useState<StaffUser[]>([
    { id: 1, name: "María González", email: "maria@almaestetica.com", role: "Administradora", active: true },
    { id: 2, name: "Carla Benítez", email: "recepcion@almaestetica.com", role: "Recepción", active: true },
  ]);

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

  // --- Handlers CRUD ---
  const handleSaveAppointment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const client = String(fd.get("client") || "");
    const payload: Omit<AppointmentItem, "id"> = {
      date: String(fd.get("date") || selectedDate),
      time: String(fd.get("time") || "09:00"),
      client,
      service: String(fd.get("service") || services[0]?.name || ""),
      pro: String(fd.get("pro") || professionals[0]?.name || ""),
      status: String(fd.get("status") || "Confirmado"),
      initials: getInitials(client),
    };

    if (appointmentModal === "new") {
      setAppointments((prev) => [...prev, { id: Date.now(), ...payload }]);
    } else if (appointmentModal) {
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointmentModal.id ? { ...item, ...payload } : item))
      );
    }
    setAppointmentModal(null);
  };

  const handleDeleteAppointment = (id: number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

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

  const handleAddUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setUsers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        role: (fd.get("role") as "Administradora" | "Recepción") || "Recepción",
        active: true,
      },
    ]);
    setUserModalOpen(false);
  };

  const pendingCount = appointments.filter((a) => a.status === "Pendiente").length;
  const dayAppointments = appointments.filter(
  (a) =>
    a.date === selectedDate &&
    (proFilter === "all" || a.pro === proFilter)
  );

  return (
    <div className="admin-app">
      <aside className="sidebar">
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
                  setActive("Mi centro");
                  setCenterMenuOpen(false);
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
              onClick={() => setActive(label)}
              className={active === label ? "active" : ""}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === "Turnos" && <b>{appointments.length}</b>}
            </button>
          ))}

          <small>CONFIGURACIÓN</small>
          <button
            onClick={() => setActive("Mi perfil")}
            className={active === "Mi perfil" ? "active" : ""}
          >
            <Icon name="settings" />
            <span>Mi perfil</span>
          </button>
          <button
            onClick={() => setActive("Usuarios")}
            className={active === "Usuarios" ? "active" : ""}
          >
            <Icon name="user" />
            <span>Usuarios</span>
          </button>
        </nav>

        <button className="logout-button" onClick={onLogout}>
          <Icon name="logout" />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button className="mobile-menu">
            <Icon name="menu" />
          </button>
          <span>
            <h1>{active}</h1>
            <p>Jueves, 18 de julio</p>
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
              <section className="welcome">
                <span>
                  <h2>Buen día, {profileInfo.name.split(" ")[0]}.</h2>
                  <p>Esto es lo que está pasando hoy en {centerInfo.name}.</p>
                </span>
              </section>

              <section className="metrics">
                <article>
                  <span className="metric-icon coral">
                    <Icon name="calendar" />
                  </span>
                  <span>
                    <small>TURNOS DE HOY</small>
                    <strong>{appointments.length}</strong>
                    <em>{pendingCount} pendientes</em>
                  </span>
                </article>
                <article>
                  <span className="metric-icon green">
                    <Icon name="check" />
                  </span>
                  <span>
                    <small>SERVICIOS ACTIVOS</small>
                    <strong>{services.length}</strong>
                    <em>Catálogo disponible</em>
                  </span>
                </article>
                <article>
                  <span className="metric-icon ochre">
                    <Icon name="services" />
                  </span>
                  <span>
                    <small>INGRESOS ESTIMADOS</small>
                    <strong>$186.500</strong>
                    <em>Agenda del día</em>
                  </span>
                </article>
                <article>
                  <span className="metric-icon mauve">
                    <Icon name="people" />
                  </span>
                  <span>
                    <small>PROFESIONALES</small>
                    <strong>{professionals.length}</strong>
                    <em>Activos en agenda</em>
                  </span>
                </article>
              </section>

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
                          {professionals.map((p) => (
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
                                    className={`timeline-event ${
                                      appt.status === "Pendiente" ? "pending" : ""
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
                <button className="primary-button" onClick={() => setAppointmentModal("new")}>
                  <Icon name="plus" /> Nuevo turno
                </button>
              </section>

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
                                onClick={() => setAppointmentModal(item)}
                              >
                                Editar
                              </button>
                              <button
                                className="table-btn danger"
                                onClick={() => handleDeleteAppointment(item.id)}
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

          {/* ==================== 3. SERVICIOS ==================== */}
          {active === "Servicios" && (
            <>
              <section className="welcome">
                <span>
                  <h2>Catálogo de servicios</h2>
                  <p>Prestaciones visibles en la página pública de reservas.</p>
                </span>
                <button className="primary-button" onClick={() => setServiceModal("new")}>
                  <Icon name="plus" /> Nuevo servicio
                </button>
              </section>

              <section className="panel">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Servicio</th>
                        <th>Descripción</th>
                        <th>Duración</th>
                        <th>Precio</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((srv) => (
                        <tr key={srv.id}>
                          <td>
                            <div className="table-entity">
                              <span className="metric-icon coral">
                                <Icon name={srv.icon} size={16} />
                              </span>
                              <strong>{srv.name}</strong>
                            </div>
                          </td>
                          <td>{srv.detail}</td>
                          <td>{srv.duration}</td>
                          <td><strong>{srv.price}</strong></td>
                          <td className="text-right">
                            <div className="table-actions">
                              <button
                                className="table-btn"
                                onClick={() => setServiceModal(srv)}
                              >
                                Editar
                              </button>
                              <button
                                className="table-btn danger"
                                onClick={() => handleDeleteService(srv.id)}
                              >
                                Eliminar
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

          {/* ==================== 4. PROFESIONALES (+ Disponibilidad) ==================== */}
          {active === "Profesionales" && (
            <>
              <section className="welcome">
                <span>
                  <h2>Equipo y disponibilidad</h2>
                  <p>Gestioná tus profesionales, especialidades y horarios de atención.</p>
                </span>
                <button
                  className="primary-button"
                  onClick={() => setProModal({ pro: "new", tab: "datos" })}
                >
                  <Icon name="plus" /> Nuevo profesional
                </button>
              </section>

              <section className="panel">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Profesional</th>
                        <th>Especialidad</th>
                        <th>Días laborales</th>
                        <th>Franja horaria</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {professionals.map((pro, idx) => (
                        <tr key={pro.id}>
                          <td>
                            <div className="table-entity">
                              <span className={`avatar avatar-list avatar-${(idx % 3) + 1}`}>
                                {pro.initials}
                              </span>
                              <strong>{pro.name}</strong>
                            </div>
                          </td>
                          <td>{pro.role}</td>
                          <td>
                            <div className="day-badges">
                              {pro.days.map((d) => (
                                <span key={d} className="day-badge">{d}</span>
                              ))}
                            </div>
                          </td>
                          <td>{pro.hours}</td>
                          <td className="text-right">
                            <div className="table-actions">
                              <button
                                className="table-btn"
                                onClick={() => setProModal({ pro, tab: "disponibilidad" })}
                              >
                                Disponibilidad
                              </button>
                              <button
                                className="table-btn"
                                onClick={() => setProModal({ pro, tab: "datos" })}
                              >
                                Editar
                              </button>
                              <button
                                className="table-btn danger"
                                onClick={() => handleDeleteProfessional(pro.id)}
                              >
                                Eliminar
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

          {/* ==================== 7. USUARIOS ==================== */}
          {active === "Usuarios" && (
            <>
              <section className="welcome">
                <span>
                  <h2>Usuarios del sistema</h2>
                  <p>Personas con acceso al panel administrativo de {centerInfo.name}.</p>
                </span>
                <button className="primary-button" onClick={() => setUserModalOpen(true)}>
                  <Icon name="plus" /> Nuevo usuario
                </button>
              </section>

              <section className="panel">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="table-entity">
                              <span className="avatar avatar-list">{getInitials(u.name)}</span>
                              <strong>{u.name}</strong>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>
                            <span className={`status ${u.active ? "" : "pending"}`}>
                              {u.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="text-right">
                            {u.id !== 1 && (
                              <button
                                className="table-btn danger"
                                onClick={() => setUsers((prev) => prev.filter((x) => x.id !== u.id))}
                              >
                                Quitar acceso
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* ==================== MODALES DE CREACIÓN / EDICIÓN ==================== */}
      {appointmentModal && (
        <div className="admin-modal-backdrop" onClick={() => setAppointmentModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{appointmentModal === "new" ? "Nuevo turno" : "Editar turno"}</h3>
            <form onSubmit={handleSaveAppointment} className="admin-form">
              <label>
                <span>Cliente</span>
                <input
                  name="client"
                  defaultValue={appointmentModal === "new" ? "" : appointmentModal.client}
                  placeholder="Nombre y apellido"
                  required
                />
              </label>
              <div className="form-grid-2">
                <label>
                  <span>Horario</span>
                  <input
                    name="time"
                    type="time"
                    defaultValue={appointmentModal === "new" ? "10:00" : appointmentModal.time}
                    required
                  />
                </label>
                <label>
                  <span>Estado</span>
                  <select
                    name="status"
                    defaultValue={appointmentModal === "new" ? "Confirmado" : appointmentModal.status}
                  >
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Servicio</span>
                <select
                  name="service"
                  defaultValue={appointmentModal === "new" ? services[0]?.name : appointmentModal.service}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Profesional</span>
                <select
                  name="pro"
                  defaultValue={appointmentModal === "new" ? professionals[0]?.name : appointmentModal.pro}
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="table-btn" onClick={() => setAppointmentModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Guardar turno
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
        <div className="admin-modal-backdrop" onClick={() => setUserModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nuevo usuario</h3>
            <form onSubmit={handleAddUser} className="admin-form">
              <label>
                <span>Nombre completo</span>
                <input name="name" placeholder="Ej. Carla Benítez" required />
              </label>
              <label>
                <span>Correo electrónico</span>
                <input name="email" type="email" placeholder="usuario@almaestetica.com" required />
              </label>
              <label>
                <span>Rol</span>
                <select name="role" defaultValue="Recepción">
                  <option value="Recepción">Recepción</option>
                  <option value="Administradora">Administradora</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="table-btn" onClick={() => setUserModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Crear usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};