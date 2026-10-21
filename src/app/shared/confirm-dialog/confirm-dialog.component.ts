import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';

export interface ConfirmData {
  titulo: string;
  mensaje: string;
  confirmar?: string;
  peligro?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>{{ data.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button [color]="data.peligro ? 'warn' : 'primary'" [mat-dialog-close]="true">
        {{ data.confirmar ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmData) {}

  /** Abre el diálogo y emite true solo si el usuario confirma. */
  static abrir(dialog: MatDialog, data: ConfirmData): Observable<boolean> {
    return dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .pipe(map(r => r === true));
  }
}
