import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

type Centro = { banner_url?: string | null; nombre?: string; titulo_pagina?: string | null; descripcion_pagina?: string | null };
type Respuesta = { status?: string; data?: Centro; message?: string };
const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const origen = new URL(API).origin;
const urlBanner = (ruta?: string | null) => ruta ? new URL(ruta, origen).href : "";

export const BannerCentroSection = ({ token }: { token: string }) => {
  const [actual, setActual] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vista, setVista] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let vigente = true;
    fetch(`${API}/centros/mi-centro`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => { const d = await r.json() as Respuesta; if (!r.ok) throw new Error(d.message || "No se pudo cargar el centro"); return d; })
      .then(d => { if (vigente) { setActual(urlBanner(d.data?.banner_url)); setTitulo(d.data?.titulo_pagina ?? ""); setDescripcion(d.data?.descripcion_pagina ?? ""); } })
      .catch(e => { if (vigente) setError(e instanceof Error ? e.message : "Error al cargar el banner"); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [token]);

  useEffect(() => {
    if (!archivo) { setVista(""); return; }
    const url = URL.createObjectURL(archivo);
    setVista(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const elegir = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(""); setMensaje("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Elegí una imagen JPG, PNG o WebP."); e.target.value = ""; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("El banner no puede superar los 5 MB."); e.target.value = ""; return;
    }
    setArchivo(file);
  };

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true); setError(""); setMensaje("");
    try {
      const datos = new FormData();
      if (archivo) datos.append("banner", archivo);
      datos.append("titulo_pagina", titulo.trim());
      datos.append("descripcion_pagina", descripcion.trim());
      const respuesta = await fetch(`${API}/centros/mi-centro/configuracion`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: datos,
      });
      const resultado = await respuesta.json() as Respuesta;
      if (!respuesta.ok) throw new Error(resultado.message || "No se pudo guardar el banner.");
      // Recuperar la ruta persistida del centro para evitar mostrar solo la vista previa.
      const centroRespuesta = await fetch(`${API}/centros/mi-centro`, { headers: { Authorization: `Bearer ${token}` } });
      const centro = await centroRespuesta.json() as Respuesta;
      if (!centroRespuesta.ok) throw new Error(centro.message || "Se guardó, pero no se pudo actualizar la vista previa.");
      setActual(centro.data?.banner_url ? urlBanner(centro.data.banner_url) + `?v=${Date.now()}` : "");
      setTitulo(centro.data?.titulo_pagina ?? "");
      setDescripcion(centro.data?.descripcion_pagina ?? "");
      setArchivo(null);
      setMensaje("Personalización guardada correctamente. Ya está disponible en la página pública.");
    } catch (e) { setError(e instanceof Error ? e.message : "Error al guardar el banner."); }
    finally { setGuardando(false); }
  };

  return (
    <section className="panel admin-form-panel" style={{ marginTop: 20 }}>
      <form className="admin-form" onSubmit={guardar}>
        <h3>Banner de la página pública</h3>
        <p>Elegí una imagen horizontal para presentar tu centro a los clientes. Formatos JPG, PNG o WebP; máximo 5 MB.</p>
        {cargando ? <p>Cargando banner...</p> : (
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e8ddd8", background: "#f8f3f0", minHeight: 160 }}>
            {(vista || actual) ? <img src={vista || actual} alt="Vista previa del banner del centro" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
              : <p style={{ textAlign: "center", padding: 48, color: "#777" }}>Todavía no hay un banner cargado.</p>}
          </div>
        )}
        <label style={{ display: "block", marginTop: 16 }}>
          <span>Seleccionar imagen</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegir} />
        </label>
        <label style={{ display: "block", marginTop: 16 }}>
          <span>Título principal de tu página</span>
          <input type="text" maxLength={150} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej.: Tu próximo gran corte empieza acá" />
        </label>
        <label style={{ display: "block", marginTop: 16 }}>
          <span>Descripción / presentación del negocio</span>
          <textarea rows={4} maxLength={2000} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Contales a tus clientes qué hace especial a tu negocio..." />
          <small>{descripcion.length}/2000 caracteres</small>
        </label>
        {error && <p role="alert" style={{ color: "#b94f3e" }}>{error}</p>}
        {mensaje && <p role="status" style={{ color: "#26794d" }}>{mensaje}</p>}
        <div className="form-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          {archivo && <button type="button" className="table-btn" onClick={() => setArchivo(null)} disabled={guardando}>Descartar selección</button>}
          <button type="submit" className="primary-button" disabled={guardando}>{guardando ? "Guardando..." : "Guardar personalización"}</button>
        </div>
      </form>
    </section>
  );
};
