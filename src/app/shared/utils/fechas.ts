import { Injectable, Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, NativeDateAdapter } from '@angular/material/core';

const dos = (n: number): string => String(n).padStart(2, '0');

/** Date -> 'yyyy-MM-dd' en hora local */
export function aIso(fecha: Date | null | undefined): string {
  if (!fecha) return '';
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

/** 'yyyy-MM-dd' -> Date local (para precargar el calendario) */
export function desdeIso(iso: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

/** Muestra y acepta dd/mm/aaaa; la semana inicia en lunes. */
@Injectable()
export class AdaptadorFechaEs extends NativeDateAdapter {
  override parse(valor: unknown): Date | null {
    if (typeof valor !== 'string') return super.parse(valor);
    const texto = valor.trim();
    if (!texto) return null;
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(texto);
    if (!m) return new Date(NaN);
    const [d, mes, a] = [+m[1], +m[2], +m[3]];
    const f = new Date(a, mes - 1, d);
    return f.getFullYear() === a && f.getMonth() === mes - 1 && f.getDate() === d ? f : new Date(NaN);
  }

  override format(fecha: Date, formato: object | string): string {
    if (formato === 'input') {
      return this.isValid(fecha) ? `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()}` : '';
    }
    return super.format(fecha, formato as object);
  }

  override getFirstDayOfWeek(): number { return 1; }
}

export const FORMATOS_FECHA: MatDateFormats = {
  parse: { dateInput: 'input' },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

export const PROVEEDORES_FECHAS: Provider[] = [
  { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
  { provide: DateAdapter, useClass: AdaptadorFechaEs },
  { provide: MAT_DATE_FORMATS, useValue: FORMATOS_FECHA },
];