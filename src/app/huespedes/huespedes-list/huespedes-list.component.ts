import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HuespedService } from '../huesped.service';
import { Huesped } from '../../shared/models/huesped.model';
import { NotificacionService } from '../../shared/services/notificacion.service';
import { PermisosService } from '../../shared/services/permisos.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { HuespedFormDialogComponent } from '../huesped-form-dialog/huesped-form-dialog.component';
import { catchError, forkJoin, of } from 'rxjs';
import { ReservaService } from '../../reservas/reserva.service';
import { claveEstadoReserva, normalizarTexto } from '../../shared/models/catalogos';

export type HuespedVista = Huesped & { conReservaActiva: boolean };

/** Identifica a un huésped por tipo + número de documento (único entre huéspedes activos). */
const claveHuesped = (tipo?: string, numero?: string): string =>
  `${normalizarTexto(tipo ?? '')}|${(numero ?? '').trim().toLowerCase()}`;

@Component({
  selector: 'app-huespedes-list',
  standalone: false,
  templateUrl: './huespedes-list.component.html',
})
export class HuespedesListComponent implements OnInit {
  datos = new MatTableDataSource<HuespedVista>([]);
  cargando = true;

  constructor(
    private reservaService: ReservaService,
    private service: HuespedService,
    private dialog: MatDialog,
    private notif: NotificacionService,
    public permisos: PermisosService,
  ) {}

  /** USER ve todo menos "eliminar"; el botón se oculta para él (el backend también responde 403). */
  get columnas(): string[] {
    return ['nombre', 'email', 'telefono', 'documento', 'nacionalidad', 'acciones'];
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    forkJoin({
      huespedes: this.service.listar(),
      // Si esta consulta falla no bloqueamos la pantalla: el backend igual responde 409.
      reservas: this.reservaService.listar().pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ huespedes, reservas }) => {
        const conReserva = new Set(
          (reservas ?? [])
            .filter(r => ['CONFIRMADA', 'EN_CURSO'].includes(claveEstadoReserva(r.estadoReserva) ?? ''))
            .map(r => claveHuesped(r.huesped?.tipoDocumento, r.huesped?.numeroDocumento)),
        );
        this.datos.data = huespedes.map(h => ({
          ...h,
          conReservaActiva: conReserva.has(claveHuesped(h.tipoDocumento, h.numeroDocumento)),
        }));
        this.cargando = false;
      },
      error: (e) => { this.cargando = false; this.notif.error(e); },
    });
  }

  filtrar(valor: string): void {
    this.datos.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(huesped?: Huesped): void {
    this.dialog
      .open(HuespedFormDialogComponent, { width: '600px', data: huesped ?? null, disableClose: true })
      .afterClosed()
      .subscribe((guardado) => { if (guardado) this.cargar(); });
  }

  eliminar(h: Huesped): void {
    ConfirmDialogComponent.abrir(this.dialog, {
      titulo: 'Eliminar huésped',
      mensaje: `¿Eliminar a ${h.nombre}? Esta acción no se puede deshacer desde la aplicación.`,
      confirmar: 'Eliminar',
      peligro: true,
    }).subscribe((ok) => {
      if (!ok) return;
      this.service.eliminar(h.id).subscribe({
        next: () => { this.notif.ok('Huésped eliminado'); this.cargar(); },
        error: (e) => this.notif.error(e),   // 409 si tiene reservas CONFIRMADA o EN_CURSO
      });
    });
  }
}
