
import { apiRequest } from "./api";
import { authService } from "./auth.service";

export interface Centro {
    id: number;
    nombre: string;
    slug: string;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    activo: boolean;
    tiempo_entre_turnos: number;
    createdAt: string;
    updatedAt: string;
}

export interface CentroFormulario {
    nombre: string;
    slug: string;
    direccion?: string | null;
    telefono?: string | null;
    email?: string | null;
    tiempo_entre_turnos?: number;
}


export interface AdministradorCentro {
    id: number;
    centro_id: number;
    nombre: string;
    email: string;
    telefono: string | null;
    rol: string;
    activo: boolean;
}

export interface AdministradorFormulario {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    rol: "ADMIN_CENTRO";
    centro_id: number;
}

interface RespuestaRegistroAdministrador {
    mensaje: string;
    usuario: AdministradorCentro;
}

interface RespuestaListadoUsuarios {
    status: string;
    data: AdministradorCentro[];
}


export type ActualizarCentro = Partial<CentroFormulario>;

const obtenerToken = (): string => {
    const token = authService.obtenerTokenSuperadmin();

    if (!token) {
        throw new Error(
            "No hay una sesión de SUPERADMIN activa."
        );
    }

    return token;
};

export const superadminService = {
    listarCentros(): Promise<Centro[]> {
        return apiRequest<Centro[]>("/centros", {
            method: "GET",
            token: obtenerToken(),
        });
    },

    obtenerCentro(id: number): Promise<Centro> {
        return apiRequest<Centro>(`/centros/${id}`, {
            method: "GET",
            token: obtenerToken(),
        });
    },

    crearCentro(datos: CentroFormulario): Promise<Centro> {
        return apiRequest<Centro>("/centros", {
            method: "POST",
            token: obtenerToken(),
            body: JSON.stringify(datos),
        });
    },

    actualizarCentro(
        id: number,
        datos: ActualizarCentro
    ): Promise<Centro> {
        return apiRequest<Centro>(`/centros/${id}`, {
            method: "PUT",
            token: obtenerToken(),
            body: JSON.stringify(datos),
        });
    },

    activarCentro(id: number): Promise<Centro> {
        return apiRequest<Centro>(
            `/centros/${id}/activar`,
            {
                method: "PATCH",
                token: obtenerToken(),
            }
        );
    },

    desactivarCentro(id: number): Promise<Centro> {
        return apiRequest<Centro>(
            `/centros/${id}/desactivar`,
            {
                method: "PATCH",
                token: obtenerToken(),
            }
        );
    },



    registrarAdministrador(
        datos: AdministradorFormulario
    ): Promise<RespuestaRegistroAdministrador> {
        const { centro_id, ...datosUsuario } = datos;

        return apiRequest<RespuestaRegistroAdministrador>(
            `/auth/registro?centro_id=${centro_id}`,
            {
                method: "POST",
                token: obtenerToken(),
                body: JSON.stringify(datosUsuario),
            }
        );
    },


    listarUsuariosPorCentro(
        centroId: number
    ): Promise<AdministradorCentro[]> {
        return apiRequest<RespuestaListadoUsuarios>(
            `/usuarios?centro_id=${centroId}`,
            {
                method: "GET",
                token: obtenerToken(),
            }
        ).then((respuesta) => respuesta.data);
    },

};
