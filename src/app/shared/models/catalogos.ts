/**
 * Catálogos y utilidades de estado.
 *
 * IMPORTANTE: hoy el backend responde la DESCRIPCIÓN del enum (p. ej. "Lista para asignarse")
 * y no su nombre. Toda la traducción descripción -> clave vive AQUÍ, en un solo lugar.
 * Si el backend empieza a enviar el nombre/código, solo cambia este archivo.
 */

export type EstadoHabitacion = 'DISPONIBLE' | 'OCUPADA' | 'LIMPIEZA' | 'MANTENIMIENTO';
export type EstadoReserva = 'CONFIRMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';
export type TipoHabitacion = 'SENCILLA' | 'DOBLE' | 'SUITE';

const normalizar = (t: string): string =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

// ───────────── Estado de habitación ─────────────
export const ESTADOS_HABITACION: { codigo: number; clave: EstadoHabitacion; etiqueta: string; descripcion: string }[] = [
  { codigo: 1, clave: 'DISPONIBLE',    etiqueta: 'Disponible',    descripcion: 'Lista para asignarse' },
  { codigo: 2, clave: 'OCUPADA',       etiqueta: 'Ocupada',       descripcion: 'Asignada a una reserva vigente' },
  { codigo: 3, clave: 'LIMPIEZA',      etiqueta: 'Limpieza',      descripcion: 'En proceso de limpieza' },
  { codigo: 4, clave: 'MANTENIMIENTO', etiqueta: 'Mantenimiento', descripcion: 'En reparación' },
];

export function claveEstadoHabitacion(texto?: string | null): EstadoHabitacion | null {
  if (!texto) return null;
  const t = normalizar(texto);
  const exacto = ESTADOS_HABITACION.find(e => normalizar(e.clave) === t || normalizar(e.descripcion) === t);
  if (exacto) return exacto.clave;
  if (t.includes('lista') || t.includes('disponible')) return 'DISPONIBLE';
  if (t.includes('asignada') || t.includes('ocupada')) return 'OCUPADA';
  if (t.includes('limpieza')) return 'LIMPIEZA';
  if (t.includes('repar') || t.includes('mantenimiento')) return 'MANTENIMIENTO';
  return null;
}

export const codigoEstadoHabitacion = (clave: EstadoHabitacion): number =>
  ESTADOS_HABITACION.find(e => e.clave === clave)!.codigo;

export const etiquetaEstadoHabitacion = (clave: EstadoHabitacion): string =>
  ESTADOS_HABITACION.find(e => e.clave === clave)!.etiqueta;

/** Matriz de cambios MANUALES (solo ADMIN). Sirve para habilitar/deshabilitar la UI; el backend decide siempre. */
export const TRANSICIONES_MANUALES: Record<EstadoHabitacion, EstadoHabitacion[]> = {
  DISPONIBLE: ['LIMPIEZA', 'MANTENIMIENTO'],
  OCUPADA: [],
  LIMPIEZA: ['DISPONIBLE', 'MANTENIMIENTO'],
  MANTENIMIENTO: ['DISPONIBLE', 'LIMPIEZA'],
};

// ───────────── Tipo de habitación ─────────────
export const TIPOS_HABITACION: { codigo: number; clave: TipoHabitacion; etiqueta: string; descripcion: string }[] = [
  { codigo: 1, clave: 'SENCILLA', etiqueta: 'Sencilla', descripcion: 'Habitacion con 1 cama' },
  { codigo: 2, clave: 'DOBLE',    etiqueta: 'Doble',    descripcion: 'Habitacion grande con 2 camas o 1 cama grande' },
  { codigo: 3, clave: 'SUITE',    etiqueta: 'Suite',    descripcion: 'Habitacion grande y lujosa con camas King Size' },
];

export function claveTipoHabitacion(texto?: string | null): TipoHabitacion | null {
  if (!texto) return null;
  const t = normalizar(texto);
  const exacto = TIPOS_HABITACION.find(x => normalizar(x.clave) === t || normalizar(x.descripcion) === t);
  if (exacto) return exacto.clave;
  if (t.includes('suite') || t.includes('king') || t.includes('lujosa')) return 'SUITE';
  if (t.includes('doble') || t.includes('2 camas')) return 'DOBLE';
  if (t.includes('sencilla') || t.includes('1 cama')) return 'SENCILLA';
  return null;
}

export const etiquetaTipoHabitacion = (texto?: string | null): string => {
  const clave = claveTipoHabitacion(texto);
  return clave ? TIPOS_HABITACION.find(x => x.clave === clave)!.etiqueta : (texto ?? '—');
};

export const codigoTipoHabitacion = (texto?: string | null): number | null => {
  const clave = claveTipoHabitacion(texto);
  return clave ? TIPOS_HABITACION.find(x => x.clave === clave)!.codigo : null;
};

// ───────────── Estado de reserva ─────────────
export const ESTADOS_RESERVA: { codigo: number; clave: EstadoReserva; etiqueta: string; descripcion: string }[] = [
  { codigo: 1, clave: 'CONFIRMADA', etiqueta: 'Confirmada', descripcion: 'Reserva creada' },
  { codigo: 2, clave: 'EN_CURSO',   etiqueta: 'En curso',   descripcion: 'Check-in realizado' },
  { codigo: 3, clave: 'FINALIZADA', etiqueta: 'Finalizada', descripcion: 'Check-out realizado' },
  { codigo: 4, clave: 'CANCELADA',  etiqueta: 'Cancelada',  descripcion: 'Reserva cancelada' },
];

export function claveEstadoReserva(texto?: string | null): EstadoReserva | null {
  if (!texto) return null;
  const t = normalizar(texto);
  const exacto = ESTADOS_RESERVA.find(e => normalizar(e.clave) === t || normalizar(e.descripcion) === t);
  if (exacto) return exacto.clave;
  if (t.includes('creada') || t.includes('confirmada')) return 'CONFIRMADA';
  if (t.includes('check-in') || t.includes('curso')) return 'EN_CURSO';
  if (t.includes('check-out') || t.includes('finalizada')) return 'FINALIZADA';
  if (t.includes('cancelad')) return 'CANCELADA';
  return null;
}

export const codigoEstadoReserva = (clave: EstadoReserva): number =>
  ESTADOS_RESERVA.find(e => e.clave === clave)!.codigo;

export const etiquetaEstadoReserva = (clave: EstadoReserva | null, textoApi?: string): string =>
  clave ? ESTADOS_RESERVA.find(e => e.clave === clave)!.etiqueta : (textoApi ?? '—');

/** Qué acciones habilita cada estado de reserva (el backend sigue siendo la autoridad). */
export function accionesReserva(estado: EstadoReserva | null) {
  return {
    checkIn:  estado === 'CONFIRMADA',
    checkOut: estado === 'EN_CURSO',
    cancelar: estado === 'CONFIRMADA',
    editar:   estado === 'CONFIRMADA' || estado === 'EN_CURSO',
    eliminar: estado === 'FINALIZADA' || estado === 'CANCELADA',
  };
}

export type EstadoRegistro = 'ACTIVO' | 'ELIMINADO';

export function claveEstadoRegistro(texto?: string | null): EstadoRegistro | null {
  if (!texto) return null;
  return normalizar(texto).startsWith('eliminad') ? 'ELIMINADO' : 'ACTIVO';
}

// ───────────── Tipo de documento ─────────────
/** El backend recibe y devuelve estos textos tal cual (INE, Licencia, Pasaporte). */
export const TIPOS_DOCUMENTO = ['INE', 'Licencia', 'Pasaporte'];
export const normalizarTexto = normalizar;
