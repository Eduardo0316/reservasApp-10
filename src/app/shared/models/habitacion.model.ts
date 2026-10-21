export interface Habitacion {
  id: number;
  numero: number;
  /** Descripción del tipo (ver catalogos.ts) */
  tipo: string;
  precio: number;
  capacidad: number;
  /** Descripción del estado (ver catalogos.ts) */
  estado: string;
}

export interface HabitacionRequest {
  numero: number;
  idTipo: number;
  precio: number;
  capacidad: number;
}
