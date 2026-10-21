export interface DatosHuesped {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nacionalidad: string;
}

export interface DatosHabitacion {
  id?: number;
  numero: number;
  tipo: string;
  precio: number;
  capacidad: number;
  estado: string;
}

export interface Reserva {
  id: number;
  huesped: DatosHuesped;
  habitacion: DatosHabitacion;
  fechaEntrada: string;   // yyyy-MM-dd
  fechaSalida: string;    // yyyy-MM-dd
  numeroPersonas: number;
  precioNoche: number;
  precioTotal: number;
  /** Descripción del estado (ver catalogos.ts) */
  estadoReserva: string;
  /** Solo llega si el backend lo expone; necesario para marcar ELIMINADAS en reportes. */
  estadoRegistro?: string;
}

export interface ReservaCrearRequest {
  idHuesped: number;
  idHabitacion: number;
  fechaEntrada: string;
  fechaSalida: string;
  numeroPersonas: number;
  /** El DTO actual del backend lo exige (no está en los requerimientos). */
  codigoReserva: number;
}

export interface ReservaActualizarRequest {
  fechaEntrada: string;
  fechaSalida: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
}
