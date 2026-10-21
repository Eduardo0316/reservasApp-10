import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeHttp } from '../utils/http-error';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  constructor(private snack: MatSnackBar) {}

  ok(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 3500 });
  }

  aviso(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 5000 });
  }

  /** Traduce cualquier error HTTP al mensaje que pide el requerimiento 8.3. */
  error(err: unknown): void {
    this.snack.open(mensajeHttp(err), 'Cerrar', { duration: 7000, panelClass: 'snack-error' });
  }
}
