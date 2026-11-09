import { useState } from "react";
import { Brand } from "../components/Brand";
import { Icon, type IconName } from "../utils/icons";
import { appointments, professionals } from "../data/demoData";

export function AdminDashboardView({ logout }: { logout: () => void }) {
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
