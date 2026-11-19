
import { apiRequest } from "./api";

export type RolUsuario =
    | "SUPERADMIN"
    | "ADMIN_CENTRO"
    | "CLIENTE";

export interface UsuarioAutenticado {
    id: number;
    nombre: string;
    email: string;
    rol: RolUsuario;
    centro_id: number | null;
}

export interface LoginResponse {
    token: string;
    usuario: UsuarioAutenticado;
}

interface Credenciales {
    email: string;
    password: string;
}

const ADMIN_TOKEN_KEY = "agendia_admin_token";
const ADMIN_SLUG_KEY = "agendia_admin_slug";
const SUPERADMIN_TOKEN_KEY = "agendia_superadmin_token";

export const authService = {
    // ==========================================
    // LOGIN
    // ==========================================

    // Login de administradores de centros.
    loginAdminCentro(
        slug: string,
        credenciales: Credenciales
    ): Promise<LoginResponse> {
        return apiRequest<LoginResponse>(
            `/auth/centros/${encodeURIComponent(slug)}/login`,
            {
                method: "POST",
                body: JSON.stringify(credenciales),
            }
        );
    },

    // Login global del SUPERADMIN.
    loginSuperadmin(
        credenciales: Credenciales
    ): Promise<LoginResponse> {
        return apiRequest<LoginResponse>(
            "/auth/admin/login",
            {
                method: "POST",
                body: JSON.stringify(credenciales),
            }
        );
    },

    // ==========================================
    // SESIÓN DEL ADMIN_CENTRO
    // ==========================================

    guardarSesionAdmin(
        token: string,
        slug: string
    ): void {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
        sessionStorage.setItem(ADMIN_SLUG_KEY, slug);
    },

    obtenerTokenAdmin(): string | null {
        return sessionStorage.getItem(ADMIN_TOKEN_KEY);
    },

    tieneSesionAdmin(slug: string): boolean {
        const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
        const slugGuardado = sessionStorage.getItem(ADMIN_SLUG_KEY);

        return Boolean(token) && slugGuardado === slug;
    },

    cerrarSesionAdmin(): void {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        sessionStorage.removeItem(ADMIN_SLUG_KEY);
    },

    // ==========================================
    // SESIÓN DEL SUPERADMIN
    // ==========================================

    guardarSesionSuperadmin(token: string): void {
        sessionStorage.setItem(SUPERADMIN_TOKEN_KEY, token);
    },

    obtenerTokenSuperadmin(): string | null {
        return sessionStorage.getItem(SUPERADMIN_TOKEN_KEY);
    },

    tieneSesionSuperadmin(): boolean {
        return Boolean(
            sessionStorage.getItem(SUPERADMIN_TOKEN_KEY)
        );
    },

    cerrarSesionSuperadmin(): void {
        sessionStorage.removeItem(SUPERADMIN_TOKEN_KEY);
    },
};
