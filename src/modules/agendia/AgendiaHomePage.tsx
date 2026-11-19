
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { centrosService, type CentroPublico, } from "../../services/centros.service";


export const AgendiaHomePage = () => {
    const navigate = useNavigate();

    const [busqueda, setBusqueda] = useState("");
    const [centros, setCentros] = useState<CentroPublico[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);



    useEffect(() => {
        const nombre = busqueda.trim();

        if (nombre.length < 2) {
            setCentros([]);
            setCargando(false);
            setError("");
            setBusquedaRealizada(false);
            return;
        }

        let cancelado = false;

        setCentros([]);
        setError("");
        setBusquedaRealizada(false);
        setCargando(true);

        const timer = setTimeout(async () => {
            try {
                const resultados = await centrosService.buscarPorNombre(nombre);

                if (cancelado) return;

                setCentros(resultados);
                setBusquedaRealizada(true);
            } catch (err) {
                if (cancelado) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Ocurrió un error al buscar centros."
                );
            } finally {
                if (!cancelado) {
                    setCargando(false);
                }
            }
        }, 350);

        return () => {
            cancelado = true;
            clearTimeout(timer);
        };
    }, [busqueda]);



    const ingresarAlCentro = (slug: string) => {
        navigate(
            `/centros/${encodeURIComponent(slug)}/admin/login`
        );
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "var(--paper)",
            }}
        >
            <header className="topbar">
                <Brand />
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                    Plataforma de gestión de turnos
                </span>
            </header>

            <section
                style={{
                    maxWidth: 760,
                    margin: "0 auto",
                    padding: "90px 24px",
                    textAlign: "center",
                }}
            >
                <h1
                    style={{
                        fontSize: "clamp(32px, 5vw, 48px)",
                        marginBottom: 20,
                    }}
                >
                    Bienvenido a Agendia
                </h1>

                <p
                    style={{
                        color: "var(--muted)",
                        lineHeight: 1.7,
                        marginBottom: 48,
                    }}
                >
                    Administrá tu negocio de manera simple.
                    Organizá tus turnos, servicios y profesionales
                    desde un solo lugar.
                </p>

                <div
                    style={{
                        padding: 32,
                        borderRadius: 16,
                        background: "var(--white)",
                        border: "1px solid var(--line)",
                        boxShadow: "var(--shadow)",
                        textAlign: "left",
                    }}
                >
                    <h2 style={{ fontSize: 23, marginBottom: 10 }}>
                        Encontrá tu centro
                    </h2>

                    <p
                        style={{
                            fontSize: 14,
                            color: "var(--muted)",
                            marginBottom: 25,
                        }}
                    >
                        Buscá el nombre de tu negocio para acceder
                        a su panel de administración.
                    </p>


                    <div>
                        <label
                            htmlFor="buscar-centro"
                            style={{
                                display: "block",
                                marginBottom: 8,
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            Nombre del centro
                        </label>

                        <input
                            id="buscar-centro"
                            type="search"
                            value={busqueda}
                            onChange={(event) => setBusqueda(event.target.value)}
                            placeholder="Ej: Bella Vista"
                            autoComplete="off"
                            style={{
                                width: "100%",
                                padding: 14,
                                borderRadius: 8,
                                border: "1px solid var(--line)",
                                background: "var(--paper)",
                            }}
                        />

                        {cargando && (
                            <p
                                role="status"
                                style={{
                                    marginTop: 12,
                                    fontSize: 13,
                                    color: "var(--muted)",
                                }}
                            >
                                Buscando centros...
                            </p>
                        )}
                    </div>


                    {error && (
                        <p role="alert" style={{ color: "var(--coral-dark)", marginTop: 20 }}>
                            {error}
                        </p>
                    )}

                    {busquedaRealizada && centros.length === 0 && (
                        <p style={{ marginTop: 24, color: "var(--muted)" }}>
                            No encontramos centros con ese nombre.
                        </p>
                    )}

                    {centros.length > 0 && (
                        <div style={{ marginTop: 28 }}>
                            <h3 style={{ fontSize: 16, marginBottom: 14 }}>
                                Resultados encontrados
                            </h3>

                            {centros.map((centro) => (
                                <button
                                    key={centro.slug}
                                    type="button"
                                    onClick={() => ingresarAlCentro(centro.slug)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        width: "100%",
                                        padding: 16,
                                        marginBottom: 10,
                                        border: "1px solid var(--line)",
                                        borderRadius: 8,
                                        background: "var(--paper)",
                                        textAlign: "left",
                                    }}
                                >
                                    <span>{centro.nombre}</span>
                                    <span
                                        style={{
                                            color: "var(--coral)",
                                            fontSize: 13,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Ingresar →
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};
