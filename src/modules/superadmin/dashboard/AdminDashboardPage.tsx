
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../../services/auth.service";
import {
  superadminService,
  type Centro,
  type AdministradorCentro,
} from "../../../services/superadmin.service";

import "./AdminDashboardPage.css";
import { CentroForm } from "./CentroForm";
import { AdministradorForm } from "./AdministradorForm";

type Seccion = "inicio" | "centros" | "administradores";

export const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarFormularioCentro, setMostrarFormularioCentro] = useState(false);
  const [centroEditar, setCentroEditar] = useState<Centro | null>(null);

  const [centros, setCentros] = useState<Centro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [centroProcesando, setCentroProcesando] = useState<number | null>(null);

  const [administradores, setAdministradores] = useState<AdministradorCentro[]>([]);

  const [cargandoAdministradores, setCargandoAdministradores] = useState(false);

  const [mostrarFormularioAdministrador, setMostrarFormularioAdministrador] = useState(false);

  const [errorAdministradores, setErrorAdministradores] = useState("");

  const [errorAccion, setErrorAccion] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarCentros = async () => {
      try {
        const resultado = await superadminService.listarCentros();

        if (activo) {
          setCentros(resultado);
          setError("");
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los centros."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    void cargarCentros();

    return () => {
      activo = false;
    };
  }, []);


  useEffect(() => {
    if (seccion !== "administradores" || cargando || error) {
      return;
    }

    let activo = true;

    const cargarAdministradores = async () => {
      setCargandoAdministradores(true);
      setErrorAdministradores("");

      try {
        const centrosActivos = centros.filter(
          (centro) => centro.activo
        );

        const resultados = await Promise.allSettled(
          centrosActivos.map((centro) =>
            superadminService.listarUsuariosPorCentro(centro.id)
          )
        );

        const usuarios: AdministradorCentro[] = [];
        let centrosConError = 0;

        resultados.forEach((resultado) => {
          if (resultado.status === "fulfilled") {
            usuarios.push(
              ...resultado.value.filter(
                (usuario) => usuario.rol === "ADMIN_CENTRO"
              )
            );
          } else {
            centrosConError++;
          }
        });

        if (activo) {
          setAdministradores(usuarios);

          if (centrosConError > 0) {
            setErrorAdministradores(
              `No se pudieron consultar los usuarios de ${centrosConError} centro(s).`
            );
          }
        }
      } catch (err) {
        if (activo) {
          setErrorAdministradores(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los administradores."
          );
        }
      } finally {
        if (activo) {
          setCargandoAdministradores(false);
        }
      }
    };

    void cargarAdministradores();

    return () => {
      activo = false;
    };
  }, [seccion, centros, cargando, error]);


  const cambiarSeccion = (nuevaSeccion: Seccion) => {
    setSeccion(nuevaSeccion);
    setMenuAbierto(false);
  };

  const cerrarSesion = () => {
    authService.cerrarSesionSuperadmin();

    navigate("/__platform/9e4c2b71/access", {
      replace: true,
    });
  };

  const centroCreado = (nuevoCentro: Centro) => {
    setCentros((anteriores) => [nuevoCentro, ...anteriores]);
    setMostrarFormularioCentro(false);
  };

  const cambiarEstadoCentro = async (centro: Centro) => {
    if (centroProcesando !== null) return;

    const accion = centro.activo ? "desactivar" : "activar";

    const confirmado = window.confirm(
      `¿Seguro que querés ${accion} el centro "${centro.nombre}"?`
    );

    if (!confirmado) return;

    setCentroProcesando(centro.id);
    setErrorAccion("");

    try {
      if (centro.activo) {
        await superadminService.desactivarCentro(centro.id);
      } else {
        await superadminService.activarCentro(centro.id);
      }

      // Consultamos nuevamente el backend para obtener el estado real.
      const centrosActualizados =
        await superadminService.listarCentros();

      setCentros(centrosActualizados);
    } catch (err) {
      setErrorAccion(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del centro."
      );
    } finally {
      setCentroProcesando(null);
    }
  };


  const editarCentro = (centro: Centro) => {
    setCentroEditar(centro);
    setMostrarFormularioCentro(true);
  };

  const totalCentros = centros.length;
  const centrosActivos = centros.filter(
    (centro) => centro.activo
  ).length;
  const centrosInactivos = totalCentros - centrosActivos;

  const centrosRecientes = [...centros]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="superadmin-dashboard">
      <header className="superadmin-dashboard-mobile-header">
        <span className="superadmin-dashboard-mobile-brand">
          Agendia
        </span>

        <button
          type="button"
          className="superadmin-dashboard-menu-toggle"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="superadmin-dashboard-navigation"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? "✕" : "☰"}
        </button>
      </header>

      {menuAbierto && (
        <button
          type="button"
          className="superadmin-dashboard-overlay"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside
        id="superadmin-dashboard-navigation"
        className={`superadmin-dashboard-sidebar ${menuAbierto ? "is-open" : ""
          }`}
      >
        <h2 className="superadmin-dashboard-brand">
          Agendia
        </h2>

        <nav
          className="superadmin-dashboard-nav"
          aria-label="Navegación del superadmin"
        >
          <button
            type="button"
            className={`superadmin-dashboard-button ${seccion === "inicio" ? "active" : ""
              }`}
            onClick={() => cambiarSeccion("inicio")}
          >
            Inicio
          </button>

          <button
            type="button"
            className={`superadmin-dashboard-button ${seccion === "centros" ? "active" : ""
              }`}
            onClick={() => cambiarSeccion("centros")}
          >
            Centros
          </button>

          <button
            type="button"
            className={`superadmin-dashboard-button ${seccion === "administradores" ? "active" : ""
              }`}
            onClick={() => cambiarSeccion("administradores")}
          >
            Administradores
          </button>
        </nav>

        <button
          type="button"
          className="superadmin-dashboard-button superadmin-dashboard-logout"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="superadmin-dashboard-content">
        {seccion === "inicio" && (
          <>
            <h1>Resumen general</h1>
            <p>
              Consultá el estado de los centros registrados
              en Agendia.
            </p>

            {cargando && <p>Cargando información...</p>}

            {error && (
              <p role="alert">
                No se pudieron obtener los centros: {error}
              </p>
            )}

            {!cargando && !error && (
              <>
                <section className="superadmin-stats">
                  <article className="superadmin-stat-card">
                    <h2>Centros registrados</h2>
                    <strong>{totalCentros}</strong>
                    <p>Total de centros en Agendia</p>
                  </article>

                  <article className="superadmin-stat-card">
                    <h2>Centros activos</h2>
                    <strong>{centrosActivos}</strong>
                    <p>Centros habilitados</p>
                  </article>

                  <article className="superadmin-stat-card">
                    <h2>Centros inactivos</h2>
                    <strong>{centrosInactivos}</strong>
                    <p>Centros deshabilitados</p>
                  </article>
                </section>

                <section className="superadmin-recent">
                  <h2>Centros recientes</h2>

                  {centrosRecientes.length === 0 ? (
                    <p>Todavía no hay centros registrados.</p>
                  ) : (
                    <div className="superadmin-table-wrapper">
                      <table className="superadmin-table">
                        <thead>
                          <tr>
                            <th>Centro</th>
                            <th>Estado</th>
                            <th>Fecha de creación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {centrosRecientes.map((centro) => (
                            <tr key={centro.id}>
                              <td>{centro.nombre}</td>
                              <td>
                                {centro.activo
                                  ? "Activo"
                                  : "Inactivo"}
                              </td>
                              <td>
                                {centro.createdAt
                                  ? new Date(
                                    centro.createdAt
                                  ).toLocaleDateString("es-AR")
                                  : "Sin fecha"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}


        {seccion === "centros" && (
          <>
            <h1>Gestión de centros</h1>

            <p>
              Administrá los centros registrados en Agendia.
            </p>
            <button
              type="button"
              className="superadmin-create-button"
              onClick={() => {
                if (mostrarFormularioCentro) {
                  setMostrarFormularioCentro(false);
                  setCentroEditar(null);
                } else {
                  setCentroEditar(null);
                  setMostrarFormularioCentro(true);
                }
              }}
            >
              {mostrarFormularioCentro ? "Cancelar" : "+ Crear centro"}
            </button>

            {mostrarFormularioCentro && (
              <CentroForm
                key={centroEditar?.id ?? "nuevo"}
                centroEditar={centroEditar ?? undefined}
                onCreado={(centroGuardado) => {
                  setCentros((anteriores) => {
                    if (centroEditar) {
                      return anteriores.map((centro) =>
                        centro.id === centroGuardado.id
                          ? centroGuardado
                          : centro
                      );
                    }

                    return [centroGuardado, ...anteriores];
                  });

                  setMostrarFormularioCentro(false);
                  setCentroEditar(null);
                }}
                onCancelar={() => {
                  setMostrarFormularioCentro(false);
                  setCentroEditar(null);
                }}
              />
            )}

            {cargando && <p>Cargando centros...</p>}

            {error && (
              <p role="alert">
                No se pudieron cargar los centros: {error}
              </p>
            )}

            {!cargando && !error && (
              <section className="superadmin-recent">
                <h2>Centros registrados ({centros.length})</h2>

                {centros.length === 0 ? (
                  <p>No hay centros registrados todavía.</p>
                ) : (
                  <div className="superadmin-table-wrapper">
                    {errorAccion && (<p role="alert">{errorAccion}</p>)}
                    <table className="superadmin-table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Slug</th>
                          <th>Correo</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {centros.map((centro) => (
                          <tr key={centro.id}>
                            <td>{centro.nombre}</td>
                            <td>{centro.slug}</td>
                            <td>{centro.email || "Sin correo"}</td>
                            <td>
                              {centro.activo ? "Activo" : "Inactivo"}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="superadmin-create-button"
                                onClick={() => editarCentro(centro)}
                                disabled={centroProcesando !== null}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="superadmin-create-button"
                                disabled={centroProcesando !== null}
                                onClick={() => cambiarEstadoCentro(centro)}
                              >
                                {centroProcesando === centro.id
                                  ? "Procesando..."
                                  : centro.activo
                                    ? "Desactivar"
                                    : "Activar"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}



        {seccion === "administradores" && (
          <>
            <h1>Gestión de administradores</h1>

            <p>
              Consultá los administradores asignados a los
              centros registrados en Agendia.
            </p>

            <button
              type="button"
              className="superadmin-create-button"
              onClick={() =>
                setMostrarFormularioAdministrador((anterior) => !anterior)
              }
            >
              {mostrarFormularioAdministrador
                ? "Cancelar"
                : "+ Crear administrador"}
            </button>

            {mostrarFormularioAdministrador && (
              <AdministradorForm
                centros={centros}
                onCreado={(nuevoAdministrador) => {
                  setAdministradores((anteriores) => {
                    if (
                      anteriores.some(
                        (admin) => admin.id === nuevoAdministrador.id
                      )
                    ) {
                      return anteriores;
                    }

                    return [...anteriores, nuevoAdministrador];
                  });

                  setMostrarFormularioAdministrador(false);
                  setErrorAdministradores("");
                }}
                onCancelar={() => setMostrarFormularioAdministrador(false)}
              />
            )}


            {(cargando || cargandoAdministradores) && (
              <p>Cargando administradores...</p>
            )}

            {error && (
              <p role="alert">
                No se pudieron cargar los centros: {error}
              </p>
            )}

            {errorAdministradores && (
              <p role="alert">{errorAdministradores}</p>
            )}

            {!cargando &&
              !cargandoAdministradores &&
              !error && (
                <section className="superadmin-recent">
                  <h2>
                    Administradores registrados (
                    {administradores.length})
                  </h2>

                  {administradores.length === 0 ? (
                    <p>
                      Todavía no hay administradores registrados en los centros
                      activos. Podés crear uno desde el botón superior.
                    </p>
                  ) : (
                    <div className="superadmin-table-wrapper">
                      <table className="superadmin-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Centro asignado</th>
                            <th>Estado</th>
                          </tr>
                        </thead>

                        <tbody>
                          {administradores.map((admin) => {
                            const centro = centros.find(
                              (item) => item.id === admin.centro_id
                            );

                            return (
                              <tr key={admin.id}>
                                <td>{admin.nombre}</td>
                                <td>{admin.email}</td>
                                <td>
                                  {centro?.nombre ?? "Sin identificar"}
                                </td>
                                <td>
                                  {admin.activo ? "Activo" : "Inactivo"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
          </>
        )}

      </main>
    </div>
  );
};
