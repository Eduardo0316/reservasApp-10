export interface Huesped {
  id: number;
  /** Hoy el backend devuelve aquí el nombre COMPLETO (nombre + apellido). */
  nombre: string;
  /** Solo llega si el backend lo expone (ver NOTAS_BACKEND.md). */
  apellido?: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nacionalidad: string;
}

export interface HuespedRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nacionalidad: string;
}
