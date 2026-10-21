import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HabitacionService } from '../habitacion.service';
import { Habitacion } from '../../shared/models/habitacion.model';
import {
  EstadoHabitacion, TRANSICIONES_MANUALES, claveEstadoHabitacion, codigoEstadoHabitacion,
  etiquetaEstadoHabitacion, etiquetaTipoHabitacion,
} from '../../shared/models/catalogos';
import { NotificacionService } from '../../shared/services/notificacion.service';
import { PermisosService } from '../../shared/services/permisos.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { HabitacionFormDialogComponent } from '../habitacion-form-dialog/habitacion-form-dialog.component';

export type HabitacionVista = Habitacion & {
  estadoClave: EstadoHabitacion | null;
  estadoEtiqueta: string;
  tipoEtiqueta: string;
  destinos: EstadoHabitacion[];
};

@Component({
  selector: 'app-habitaciones-list',
  standalone: false,
  templateUrl: './habitaciones-list.component.html',
})
export class HabitacionesListComponent implements OnInit {
  datos = new MatTableDataSource<HabitacionVista>([]);
  cargando = true;

  constructor(
    private service: HabitacionService,
    private dialog: MatDialog,
    private notif: NotificacionService,
    public permisos: PermisosService,
  ) {}

  get columnas(): string[] {
    const base = ['numero', 'tipo', 'precio', 'capacidad', 'estado'];
    return this.permisos.esAdmin ? [...base, 'acciones'] : base;
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar().subscribe({
      next: (lista) => { this.datos.data = lista.map(h => this.aVista(h)); this.cargando = false; },
      error: (e) => { this.cargando = false; this.notif.error(e); },
    });
  }

  filtrar(valor: string): void {
    this.datos.filter = valor.trim().toLowerCase();
  }

  etiqueta(e: EstadoHabitacion): string {
    return etiquetaEstadoHabitacion(e);
  }

  abrirFormulario(habitacion?: Habitacion): void {
    this.dialog
      .open(HabitacionFormDialogComponent, { width: '520px', data: habitacion ?? null, disableClose: true })
      .afterClosed()
      .subscribe((guardado) => { if (guardado) this.cargar(); });
  }

  cambiarEstado(h: HabitacionVista, destino: EstadoHabitacion): void {
    this.service.cambiarEstado(h.id, codigoEstadoHabitacion(destino)).subscribe({
      next: () => { this.notif.ok(`Habitación ${h.numero} ahora está en ${etiquetaEstadoHabitacion(destino)}`); this.cargar(); },
      error: (e) => this.notif.error(e),
    });
  }

  eliminar(h: HabitacionVista): void {
    ConfirmDialogComponent.abrir(this.dialog, {
      titulo: 'Eliminar habitación',
      mensaje: `¿Eliminar la habitación ${h.numero}?`,
      confirmar: 'Eliminar',
      peligro: true,
    }).subscribe((ok) => {
      if (!ok) return;
      this.service.eliminar(h.id).subscribe({
        next: () => { this.notif.ok('Habitación eliminada'); this.cargar(); },
        error: (e) => this.notif.error(e),   // 409 si está OCUPADA
      });
    });
  }

  private aVista(h: Habitacion): HabitacionVista {
    const estadoClave = claveEstadoHabitacion(h.estado);
    return {
      ...h,
      estadoClave,
      estadoEtiqueta: estadoClave ? etiquetaEstadoHabitacion(estadoClave) : h.estado,
      tipoEtiqueta: etiquetaTipoHabitacion(h.tipo),
      destinos: estadoClave ? TRANSICIONES_MANUALES[estadoClave] : [],
    };
  }
}
