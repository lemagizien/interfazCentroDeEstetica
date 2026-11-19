import { apiRequest } from "./api";

// Datos públicos que necesitamos mostrar en el buscador.
export interface CentroPublico {
  nombre: string;
  slug: string;
}

// Estructura de respuesta del backend.
interface BuscarCentrosResponse {
  status: string;
  data: CentroPublico[];
}

export const centrosService = {
  // Buscar centros activos por nombre.
  async buscarPorNombre(nombre: string): Promise<CentroPublico[]> {
    const nombreLimpio = nombre.trim();

    if (nombreLimpio.length < 2) {
      return [];
    }

    const resultado = await apiRequest<BuscarCentrosResponse>(
      `/centros/publico/buscar?nombre=${encodeURIComponent(nombreLimpio)}`
    );

    if (!Array.isArray(resultado.data)) {
      throw new Error(
        "El servidor devolvió una respuesta de búsqueda inválida."
      );
    }

    return resultado.data;
  },
};
