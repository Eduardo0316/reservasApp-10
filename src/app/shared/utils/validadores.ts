import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Obligatorio y con longitud entre min y max DESPUÉS de hacer trim (igual que el backend). */
export function longitudTrim(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = (c.value ?? '').toString().trim();
    if (!v) return { required: true };
    return v.length < min || v.length > max ? { longitudTrim: { min, max } } : null;
  };
}

/** Exactamente 10 dígitos (admite espacios alrededor, como el backend). */
export const telefono10: ValidatorFn = (c) => {
  const v = (c.value ?? '').toString();
  if (!v) return null;
  return /^\d{10}$/.test(v) ? null : { telefono: true };
};

export const enteroMayorQueCero: ValidatorFn = (c) => {
  const v = c.value;
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? null : { enteroPositivo: true };
};

export const mayorQueCero: ValidatorFn = (c) => {
  const v = c.value;
  if (v === null || v === undefined || v === '') return null;
  return Number(v) > 0 ? null : { positivo: true };
};

/** fechaEntrada < fechaSalida (usa getRawValue para funcionar aunque un campo esté deshabilitado). */
export const fechasOrdenadas: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const { fechaEntrada, fechaSalida } = (g as FormGroup).getRawValue();
  if (!(fechaEntrada instanceof Date) || !(fechaSalida instanceof Date)) return null;
  return fechaEntrada.getTime() < fechaSalida.getTime() ? null : { fechasOrden: true };
};
