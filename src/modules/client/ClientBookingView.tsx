// src/modules/client/ClientBookingView.tsx
import { useState } from "react";
import { Brand } from "../../components/Brand";
import { Icon } from "../../components/Icon";
import { services } from "@/data/mockServices";
import { professionals } from "@/data/mockProfessionals";
import { booking } from "@/data/mockBooking";

const slots = ["10:30", "11:30", "14:00", "16:30"];

interface ClientBookingViewProps {
  onLogout: () => void;
}

export const ClientBookingView = ({ onLogout }: ClientBookingViewProps) => {
  const [service, setService] = useState(1);
  const [professional, setProfessional] = useState(1);
  const [date, setDate] = useState(0);
  const [time, setTime] = useState("10:30");
  const [confirmed, setConfirmed] = useState(false);

  const selectedService = services.find((item) => item.id === service) || services[0];
  const selectedProfessional = professionals.find((item) => item.id === professional) || professionals[0];

  return (
    <div className="client-app">
      <header className="topbar">
        <Brand />
        <nav className="main-nav" aria-label="Navegación principal">
          <button className="nav-link active">Reservar turno</button>
          <button className="nav-link" onClick={onLogout}>Cerrar sesión</button>
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
                  {booking.map((item, index) => (
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
              <div className="summary-line"><span><Icon name="calendar" /> Fecha</span><strong>{booking[date].label}, {booking[date].number} de julio</strong></div>
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
};