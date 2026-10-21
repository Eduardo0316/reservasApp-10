import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

/** Formato application/problem+json que devuelve el backend. */
export interface ProblemaHttp {
  status?: number;
  title?: string;
  detail?: string;
  /** En 400 de validación: ["campo: mensaje", ...] */
  errores?: string[];
}

/** Mensaje por código HTTP (requerimiento 8.3). */
export function mensajeHttp(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado.';
  const p = (err.error ?? {}) as ProblemaHttp;
  switch (err.status) {
    case 0:   return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    case 400: return p.errores?.length ? p.errores.join(' · ') : (p.detail ?? 'Los datos enviados no son válidos.');
    case 401: return 'Tu sesión expiró. Inicia sesión de nuevo.';
    case 403: return 'No tienes permiso para realizar esta acción.';
    case 404: return p.detail ?? 'El recurso solicitado no existe.';
    case 409: return p.detail ?? 'La operación incumple una regla de negocio.';
    case 503: return 'El servicio no está disponible. Intenta de nuevo más tarde.';
    default:  return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}

/**
 * 400 de validación -> marca cada campo con su mensaje del servidor.
 * Devuelve true si pudo asignar al menos un error a un campo del formulario.
 */
export function aplicarErroresAlFormulario(form: FormGroup, err: unknown): boolean {
  if (!(err instanceof HttpErrorResponse) || err.status !== 400) return false;
  const errores = ((err.error ?? {}) as ProblemaHttp).errores ?? [];
  let aplicado = false;
  for (const linea of errores) {
    const i = linea.indexOf(':');
    if (i < 0) continue;
    const control = form.get(linea.slice(0, i).trim());
    if (control) {
      control.setErrors({ servidor: linea.slice(i + 1).trim() });
      control.markAsTouched();
      aplicado = true;
    }
  }
  return aplicado;
}
