import { useState, type ReactNode } from "react";

type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "grid"
  | "home"
  | "logout"
  | "menu"
  | "people"
  | "plus"
  | "scissors"
  | "services"
  | "settings"
  | "sparkle"
  | "user";

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="m9 18 6-6-6-6" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  logout: <path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  scissors: (
    <>
      <circle cx="6" cy="7" r="3" />
      <circle cx="6" cy="17" r="3" />
      <path d="m8.5 8.5 11 7.5M8.5 15.5 19.5 8" />
    </>
  ),
  services: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  sparkle: <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3ZM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const services = [
  { id: 1, name: "Limpieza facial", detail: "Renovación profunda", time: "60 min", price: "$28.000", icon: "sparkle" as IconName },
  { id: 2, name: "Masajes", detail: "Relajante descontracturante", time: "45 min", price: "$24.000", icon: "services" as IconName },
  { id: 3, name: "Manicuría", detail: "Esmaltado semipermanente", time: "50 min", price: "$18.500", icon: "sparkle" as IconName },
  { id: 4, name: "Corte & brushing", detail: "Diseño personalizado", time: "60 min", price: "$22.000", icon: "scissors" as IconName },
];

const professionals = [
  { id: 1, name: "Sofía Méndez", role: "Cosmetóloga", initials: "SM" },
  { id: 2, name: "Valentina Paz", role: "Esteticista", initials: "VP" },
  { id: 3, name: "Lucía Ramos", role: "Dermocosmiatra", initials: "LR" },
];

const dates = [
  { day: "HOY", number: "18", label: "Jue" },
  { day: "VIE", number: "19", label: "Vie" },
  { day: "SÁB", number: "20", label: "Sáb" },
  { day: "LUN", number: "22", label: "Lun" },
  { day: "MAR", number: "23", label: "Mar" },
];

const slots = ["09:00", "10:30", "12:00", "15:30", "17:00", "18:30"];

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark"><Icon name="sparkle" size={18} /></span>
      <span className="brand-name">Leo Messi</span>
      <span className="brand-sub">ESTÉTICA</span>
    </div>
  );
}

function LoginApp({ enter }: { enter: (role: "client" | "admin") => void }) {
  const [register, setRegister] = useState(false);
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand"><Brand /></div>
        <div className="login-quote">
          <span className="eyebrow"><Icon name="sparkle" size={14} /> BIENESTAR A TU MANERA</span>
          <h1>Tu momento,<br /><em>tu espacio.</em></h1>
          <p>Reservá experiencias de cuidado pensadas especialmente para vos.</p>
        </div>
        <small className="photo-credit">Fotografía de Unsplash</small>
      </section>
      <section className="login-form-wrap">
        <div className="login-form">
          <span className="mobile-brand"><Brand /></span>
          <div className="login-heading">
            <span className="login-icon"><Icon name="user" /></span>
            <h2>{register ? "Creá tu cuenta" : "Qué bueno verte de nuevo"}</h2>
            <p>{register ? "Registrate como cliente para empezar a reservar." : "Ingresá a tu cuenta para gestionar tus turnos."}</p>
          </div>
          {register && (
            <label>
              Nombre completo
              <input type="text" placeholder="Martina Morales" />
            </label>
          )}
          <label>
            Correo electrónico
            <input type="email" placeholder="tu@email.com" />
          </label>
          <label>
            <span>Contraseña {!register && <button>¿La olvidaste?</button>}</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="primary-button login-submit" onClick={() => enter("client")}>
            {register ? "Crear cuenta" : "Ingresar"} <Icon name="arrow" />
          </button>
          <div className="login-separator"><span>o probá la demo</span></div>
          <button className="admin-demo" onClick={() => enter("admin")}><Icon name="grid" /> Ingresar como administrador</button>
          <p className="register-prompt">
            {register ? "¿Ya tenés una cuenta?" : "¿Todavía no tenés cuenta?"}
            <button onClick={() => setRegister(!register)}>{register ? " Ingresá" : " Registrate gratis"}</button>
          </p>
          <small className="login-note">El registro público crea únicamente cuentas con rol cliente.</small>
        </div>
      </section>
    </main>
  );
}

function ClientApp({ openAdmin, logout }: { openAdmin: () => void; logout: () => void }) {
  const [service, setService] = useState(1);
  const [professional, setProfessional] = useState(1);
  const [date, setDate] = useState(0);
  const [time, setTime] = useState("10:30");
  const [confirmed, setConfirmed] = useState(false);
  const selectedService = services.find((item) => item.id === service)!;
  const selectedProfessional = professionals.find((item) => item.id === professional)!;

  return (
    <div className="client-app">
      <header className="topbar">
        <Brand />
        <nav className="main-nav" aria-label="Navegación principal">
          <button className="nav-link active">Reservar turno</button>
          <button className="nav-link" onClick={logout}>Cerrar sesión</button>
          {/* <button className="nav-link" onClick={openAdmin}>Administración</button> */}
        </nav>
        <div className="user-menu">
          <span className="user-copy"><strong>Hola, Martina</strong><small>Mi cuenta</small></span>
          <span className="avatar avatar-small">MM</span>
          <Icon name="chevron" size={15} />
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="sparkle" size={14} /> TU MOMENTO ES AHORA</span>
            <h1>Regalate un momento <em>para vos.</em></h1>
            <p>Elegí tu servicio, profesional y horario. Nosotros nos ocupamos del resto.</p>
            <div className="hero-trust">
              <span className="avatar-stack"><i>SM</i><i>VP</i><i>LR</i></span>
              <span><strong>+850</strong> turnos realizados este mes</span>
            </div>
          </div>
          <div className="hero-image" role="img" aria-label="Interior cálido y luminoso del centro de estética">
            <div className="hero-card">
              <span className="availability-dot" />
              <span><strong>Abierto hoy</strong><small>Hasta las 20:00 hs</small></span>
            </div>
          </div>
        </section>

        <section className="booking-section">
          <div className="section-heading">
            <span><small>RESERVA ONLINE</small><h2>Agendá tu próxima visita</h2></span>
            <p>En simples pasos, sin llamadas ni esperas.</p>
          </div>

          <div className="booking-layout">
            <div className="booking-flow">
              <div className="booking-block">
                <div className="step-title">
                  <span className="step-number">1</span>
                  <span><h3>Elegí un servicio</h3><p>¿Qué te gustaría hacerte?</p></span>
                </div>
                <div className="service-grid">
                  {services.map((item) => (
                    <button
                      key={item.id}
                      className={`service-card ${service === item.id ? "selected" : ""}`}
                      onClick={() => setService(item.id)}
                    >
                      {service === item.id && <span className="selected-check"><Icon name="check" size={13} /></span>}
                      <span className="service-icon"><Icon name={item.icon} /></span>
                      <span className="service-info"><strong>{item.name}</strong><small>{item.detail}</small></span>
                      <span className="service-meta"><strong>{item.price}</strong><small><Icon name="clock" size={13} /> {item.time}</small></span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="booking-block">
                <div className="step-title">
                  <span className="step-number">2</span>
                  <span><h3>Elegí un profesional</h3><p>Todos son especialistas en este servicio.</p></span>
                </div>
                <div className="professional-row">
                  {professionals.map((item, index) => (
                    <button
                      key={item.id}
                      className={`professional-card ${professional === item.id ? "selected" : ""}`}
                      onClick={() => setProfessional(item.id)}
                    >
                      <span className={`avatar avatar-${index + 1}`}>{item.initials}</span>
                      <span><strong>{item.name}</strong><small>{item.role}</small></span>
                      {professional === item.id && <Icon name="check" size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="booking-block">
                <div className="step-title">
                  <span className="step-number">3</span>
                  <span><h3>Elegí día y horario</h3><p>Horarios disponibles para {selectedProfessional.name.split(" ")[0]}.</p></span>
                </div>
                <div className="date-row">
                  {dates.map((item, index) => (
                    <button key={item.number} onClick={() => setDate(index)} className={`date-card ${date === index ? "selected" : ""}`}>
                      <small>{item.day}</small><strong>{item.number}</strong><span>{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="slots">
                  {slots.map((slot) => (
                    <button key={slot} onClick={() => setTime(slot)} className={time === slot ? "selected" : ""}>{slot}</button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="summary-card">
              <span className="summary-label">RESUMEN DE TU TURNO</span>
              <div className="summary-service">
                <span className="service-icon large"><Icon name={selectedService.icon} size={24} /></span>
                <span><strong>{selectedService.name}</strong><small>{selectedService.detail}</small></span>
              </div>
              <div className="summary-line"><span><Icon name="user" /> Profesional</span><strong>{selectedProfessional.name}</strong></div>
              <div className="summary-line"><span><Icon name="calendar" /> Fecha</span><strong>{dates[date].label}, {dates[date].number} de julio</strong></div>
              <div className="summary-line"><span><Icon name="clock" /> Horario</span><strong>{time} hs</strong></div>
              <div className="summary-price"><span>Total</span><strong>{selectedService.price}</strong></div>
              <button className="primary-button" onClick={() => setConfirmed(true)}>
                {confirmed ? <><Icon name="check" /> ¡Turno confirmado!</> : <>Confirmar turno <Icon name="arrow" /></>}
              </button>
              <p className="summary-help"><Icon name="check" size={14} /> Podés cancelar sin cargo hasta 24 hs antes.</p>
            </aside>
          </div>
        </section>
      </main>
      <footer><Brand /><span>Av. Corrientes 1847 · Buenos Aires</span><span>© 2025 Alma Estética</span></footer>
    </div>
  );
}

const appointments = [
  { time: "09:00", client: "Camila Torres", service: "Limpieza facial", pro: "Sofía Méndez", status: "Confirmado", initials: "CT" },
  { time: "10:30", client: "Julieta Ríos", service: "Manicuría", pro: "Valentina Paz", status: "Confirmado", initials: "JR" },
  { time: "12:00", client: "Marina López", service: "Masajes", pro: "Lucía Ramos", status: "Pendiente", initials: "ML" },
  { time: "15:30", client: "Agustina Silva", service: "Corte & brushing", pro: "Sofía Méndez", status: "Confirmado", initials: "AS" },
];

function AdminApp({ closeAdmin, logout }: { closeAdmin: () => void; logout: () => void }) {
  const [active, setActive] = useState("Resumen");
  const nav = [
    ["Resumen", "grid"], ["Turnos", "calendar"], ["Servicios", "services"], ["Profesionales", "people"], ["Disponibilidad", "clock"],
  ] as [string, IconName][];
  return (
    <div className="admin-app">
      <aside className="sidebar">
        <Brand />
        <div className="center-switch"><span className="center-logo">AE</span><span><strong>Alma Estética</strong><small>Centro activo</small></span><Icon name="chevron" size={15} /></div>
        <nav className="side-nav">
          <small>GESTIÓN</small>
          {nav.map(([label, icon]) => <button key={label} onClick={() => setActive(label)} className={active === label ? "active" : ""}><Icon name={icon} /><span>{label}</span>{label === "Turnos" && <b>12</b>}</button>)}
          <small>CONFIGURACIÓN</small>
          <button><Icon name="settings" /><span>Mi centro</span></button>
          <button><Icon name="user" /><span>Usuarios</span></button>
        </nav>
        <button className="logout-button" onClick={logout}><Icon name="logout" /><span>Cerrar sesión</span></button>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <button className="mobile-menu"><Icon name="menu" /></button>
          <span><h1>{active}</h1><p>Jueves, 18 de julio</p></span>
          <div className="admin-profile"><span><strong>María González</strong><small>Administradora</small></span><span className="avatar avatar-small">MG</span><Icon name="chevron" size={15} /></div>
        </header>

        <div className="admin-content">
          <section className="welcome">
            <span><h2>Buen día, María.</h2><p>Esto es lo que está pasando hoy en tu centro.</p></span>
            <button className="primary-button"><Icon name="plus" /> Nuevo turno</button>
          </section>
          <section className="metrics">
            <article><span className="metric-icon coral"><Icon name="calendar" /></span><span><small>TURNOS DE HOY</small><strong>12</strong><em>3 pendientes</em></span></article>
            <article><span className="metric-icon green"><Icon name="check" /></span><span><small>COMPLETADOS</small><strong>7</strong><em>+12% vs. semana anterior</em></span></article>
            <article><span className="metric-icon ochre"><Icon name="services" /></span><span><small>INGRESOS DEL DÍA</small><strong>$186.500</strong><em>8 servicios cobrados</em></span></article>
            <article><span className="metric-icon mauve"><Icon name="people" /></span><span><small>CLIENTES NUEVOS</small><strong>4</strong><em>Esta semana</em></span></article>
          </section>

          <div className="admin-grid">
            <section className="panel appointments-panel">
              <div className="panel-heading"><span><h3>Próximos turnos</h3><p>Agenda de hoy</p></span><button>Ver agenda completa <Icon name="arrow" size={15} /></button></div>
              <div className="appointment-list">
                {appointments.map((item) => (
                  <div className="appointment" key={item.time}>
                    <strong className="appointment-time">{item.time}</strong>
                    <span className="avatar avatar-list">{item.initials}</span>
                    <span className="appointment-client"><strong>{item.client}</strong><small>{item.service}</small></span>
                    <span className="appointment-pro"><small>PROFESIONAL</small><strong>{item.pro}</strong></span>
                    <span className={`status ${item.status === "Pendiente" ? "pending" : ""}`}>{item.status}</span>
                    <button className="more">•••</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel availability-panel">
              <div className="panel-heading"><span><h3>Equipo hoy</h3><p>Disponibilidad en tiempo real</p></span><button><Icon name="arrow" size={15} /></button></div>
              {professionals.map((item, index) => (
                <div className="team-member" key={item.id}>
                  <span className={`avatar avatar-${index + 1}`}>{item.initials}</span>
                  <span><strong>{item.name}</strong><small>{index === 1 ? "5 de 7 turnos" : index === 2 ? "3 de 6 turnos" : "4 de 6 turnos"}</small></span>
                  <span className="capacity"><i><b style={{ width: `${[66, 71, 50][index]}%` }} /></i><small>{[2, 2, 3][index]} libres</small></span>
                </div>
              ))}
              <button className="outline-button">Gestionar disponibilidad</button>
            </section>
          </div>

          <section className="quick-actions">
            <span><h3>Accesos rápidos</h3><p>Administrá tu centro</p></span>
            <button><span><Icon name="services" /></span><strong>Nuevo servicio</strong><small>Sumá una prestación</small><Icon name="arrow" /></button>
            <button><span><Icon name="people" /></span><strong>Agregar profesional</strong><small>Ampliá tu equipo</small><Icon name="arrow" /></button>
            <button><span><Icon name="clock" /></span><strong>Editar horarios</strong><small>Configurá la agenda</small><Icon name="arrow" /></button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<"client" | "admin" | null>(null);
  if (!role) return <LoginApp enter={setRole} />;
  return role === "admin"
    ? <AdminApp closeAdmin={() => setRole("client")} logout={() => setRole(null)} />
    : <ClientApp openAdmin={() => setRole("admin")} logout={() => setRole(null)} />;
}
