import { AbstractControl } from '@angular/forms';

/** Texto de error para un campo (validaciones locales o errores devueltos por el servidor). */
export function mensajeError(c: AbstractControl | null): string {
  if (!c || !c.errors) return '';
  const e = c.errors;
  if (e['servidor']) return e['servidor'];
  if (e['required']) return 'Este campo es obligatorio';
  if (e['longitudTrim']) return `Debe tener entre ${e['longitudTrim'].min} y ${e['longitudTrim'].max} caracteres`;
  if (e['email']) return 'Ingresa un correo válido';
  if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres`;
  if (e['telefono']) return 'Debe tener exactamente 10 dígitos';
  if (e['enteroPositivo']) return 'Debe ser un número entero mayor a 0';
  if (e['positivo']) return 'Debe ser mayor a 0';
  if (e['max']) return `No puede ser mayor a ${e['max'].max}`;
  if (e['min']) return `No puede ser menor a ${e['min'].min}`;
  return 'Valor inválido';
}
