
import { apiRequest } from "./api";

/* ========================================
   SERVICIOS
======================================== */

export interface ServicioCentro {
  id: number;
  centro_id: number;
  nombre: string;
  descripcion: string | null;
  precio: number | string;
  duracion_minutos: number;
  activo: boolean;
}

export interface ServicioFormulario {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  duracion_minutos: number;
}

interface RespuestaServicio {
  mensaje: string;
  servicio: ServicioCentro;
}

/* ========================================
   PROFESIONALES
======================================== */

export interface ProfesionalCentro {
  id: number;
  centro_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  especialidad: string | null;
  activo: boolean;
  servicios: ServicioCentro[];
}

export interface ProfesionalFormulario {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  especialidad?: string | null;
  servicios?: number[];
}

interface RespuestaProfesionales {
  status: string;
  data: ProfesionalCentro[];
}

interface RespuestaProfesional {
  status: string;
  data: ProfesionalCentro;
}

/* ========================================
   SERVICIO ADMIN CENTRO
======================================== */

export const adminCentroService = {
  /* ---------- SERVICIOS ---------- */

  listarServicios(token: string): Promise<ServicioCentro[]> {
    return apiRequest<ServicioCentro[]>("/servicios", {
      method: "GET",
      token,
    });
  },

  async crearServicio(
    token: string,
    datos: ServicioFormulario
  ): Promise<ServicioCentro> {
    const respuesta = await apiRequest<RespuestaServicio>(
      "/servicios",
      {
        method: "POST",
        token,
        body: JSON.stringify(datos),
      }
    );

    return respuesta.servicio;
  },

  async actualizarServicio(
    token: string,
    id: number,
    datos: Partial<ServicioFormulario>
  ): Promise<ServicioCentro> {
    const respuesta = await apiRequest<RespuestaServicio>(
      `/servicios/${id}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify(datos),
      }
    );

    return respuesta.servicio;
  },

  async activarServicio(
    token: string,
    id: number
  ): Promise<ServicioCentro> {
    const respuesta = await apiRequest<RespuestaServicio>(
      `/servicios/${id}/activar`,
      {
        method: "PATCH",
        token,
      }
    );

    return respuesta.servicio;
  },

  async desactivarServicio(
    token: string,
    id: number
  ): Promise<ServicioCentro> {
    const respuesta = await apiRequest<RespuestaServicio>(
      `/servicios/${id}/desactivar`,
      {
        method: "PATCH",
        token,
      }
    );

    return respuesta.servicio;
  },

  /* ---------- PROFESIONALES ---------- */

  async listarProfesionales(
    token: string
  ): Promise<ProfesionalCentro[]> {
    const respuesta = await apiRequest<RespuestaProfesionales>(
      "/profesionales",
      {
        method: "GET",
        token,
      }
    );

    return respuesta.data;
  },

  async crearProfesional(
    token: string,
    datos: ProfesionalFormulario
  ): Promise<ProfesionalCentro> {
    const respuesta = await apiRequest<RespuestaProfesional>(
      "/profesionales",
      {
        method: "POST",
        token,
        body: JSON.stringify(datos),
      }
    );

    return respuesta.data;
  },

  async actualizarProfesional(
    token: string,
    id: number,
    datos: Partial<ProfesionalFormulario>
  ): Promise<ProfesionalCentro> {
    const respuesta = await apiRequest<RespuestaProfesional>(
      `/profesionales/${id}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify(datos),
      }
    );

    return respuesta.data;
  },

  async activarProfesional(
    token: string,
    id: number
  ): Promise<ProfesionalCentro> {
    const respuesta = await apiRequest<RespuestaProfesional>(
      `/profesionales/${id}/activar`,
      {
        method: "PATCH",
        token,
      }
    );

    return respuesta.data;
  },

  async desactivarProfesional(
    token: string,
    id: number
  ): Promise<ProfesionalCentro> {
    const respuesta = await apiRequest<RespuestaProfesional>(
      `/profesionales/${id}/desactivar`,
      {
        method: "PATCH",
        token,
      }
    );

    return respuesta.data;
  },
};
