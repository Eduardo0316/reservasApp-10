import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Reserva } from '../../shared/models/reserva.model';
import { EstadoReserva, claveEstadoReserva, etiquetaEstadoReserva, etiquetaTipoHabitacion } from '../../shared/models/catalogos';

type FilaReporte = Reserva & {
  estadoClave: EstadoReserva | null;
  estadoEtiqueta: string;
  tipoHabitacion: string;
  eliminada: boolean;
};

/** Tabla de solo lectura reutilizada por las dos pestañas del reporte. */
@Component({
  selector: 'app-reservas-tabla',
  standalone: false,
  template: `
    <div class="tabla-contenedor">
      <table mat-table [dataSource]="fuente">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td mat-cell *matCellDef="let r">{{ r.id }}</td>
        </ng-container>
        <ng-container matColumnDef="huesped">
          <th mat-header-cell *matHeaderCellDef>Huésped</th>
          <td mat-cell *matCellDef="let r">{{ r.huesped?.nombre }}<div class="secundario">{{ r.huesped?.email }}</div></td>
        </ng-container>
        <ng-container matColumnDef="habitacion">
          <th mat-header-cell *matHeaderCellDef>Habitación</th>
          <td mat-cell *matCellDef="let r">{{ r.habitacion?.numero }}<div class="secundario">{{ r.tipoHabitacion }}</div></td>
        </ng-container>
        <ng-container matColumnDef="fechas">
          <th mat-header-cell *matHeaderCellDef>Estancia</th>
          <td mat-cell *matCellDef="let r">{{ r.fechaEntrada }} → {{ r.fechaSalida }}</td>
        </ng-container>
        <ng-container matColumnDef="personas">
          <th mat-header-cell *matHeaderCellDef>Personas</th>
          <td mat-cell *matCellDef="let r">{{ r.numeroPersonas }}</td>
        </ng-container>
        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let r">{{ r.precioTotal | currency:'MXN':'symbol-narrow' }}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let r">
            <span class="chip" [ngClass]="'chip-' + (r.estadoClave ?? 'DESCONOCIDO')">{{ r.estadoEtiqueta }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="registro">
          <th mat-header-cell *matHeaderCellDef>Registro</th>
          <td mat-cell *matCellDef="let r">
            @if (r.estadoRegistro) {
              <span class="chip" [ngClass]="r.eliminada ? 'chip-ELIMINADO' : 'chip-ACTIVO'">
                {{ r.eliminada ? 'Eliminada' : 'Activa' }}
              </span>
            } @else { — }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnas"></tr>
        <tr mat-row *matRowDef="let row; columns: columnas" [class.fila-eliminada]="row.eliminada"></tr>
        <tr class="mat-row" *matNoDataRow>
          <td class="sin-datos" [attr.colspan]="columnas.length">Sin reservas</td>
        </tr>
      </table>
    </div>
  `,
})
export class ReservasTablaComponent {
  readonly columnas = ['id', 'huesped', 'habitacion', 'fechas', 'personas', 'total', 'estado', 'registro'];
  fuente = new MatTableDataSource<FilaReporte>([]);

  @Input() set datos(lista: Reserva[] | null) {
    this.fuente.data = (lista ?? []).map((r) => {
      const estadoClave = claveEstadoReserva(r.estadoReserva);
      return {
        ...r,
        estadoClave,
        estadoEtiqueta: etiquetaEstadoReserva(estadoClave, r.estadoReserva),
        tipoHabitacion: etiquetaTipoHabitacion(r.habitacion?.tipo),
        eliminada: (r.estadoRegistro ?? '').toUpperCase().startsWith('ELIMINAD'),
      };
    });
  }
}
