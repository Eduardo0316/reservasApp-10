import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ReservaService } from '../reserva.service';
import { Reserva } from '../../shared/models/reserva.model';
import {
  EstadoReserva, accionesReserva, claveEstadoReserva, codigoEstadoReserva,
  etiquetaEstadoReserva, etiquetaTipoHabitacion,
} from '../../shared/models/catalogos';
import { NotificacionService } from '../../shared/services/notificacion.service';
import { PermisosService } from '../../shared/services/permisos.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ReservaFormDialogComponent } from '../reserva-form-dialog/reserva-form-dialog.component';

export type ReservaVista = Reserva & {
  estadoClave: EstadoReserva | null;
  estadoEtiqueta: string;
  tipoHabitacion: string;
  acciones: ReturnType<typeof accionesReserva>;
};

@Component({
  selector: 'app-reservas-list',
  standalone: false,
  templateUrl: './reservas-list.component.html',
})
export class ReservasListComponent implements OnInit {
  datos = new MatTableDataSource<ReservaVista>([]);
  cargando = true;
  columnas = ['id', 'huesped', 'habitacion', 'fechas', 'personas', 'precioNoche', 'precioTotal', 'estado', 'acciones'];

  constructor(
    private service: ReservaService,
    private dialog: MatDialog,
    private notif: NotificacionService,
    public permisos: PermisosService,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar().subscribe({
      next: (lista) => { this.datos.data = lista.map(r => this.aVista(r)); this.cargando = false; },
      error: (e) => { this.cargando = false; this.notif.error(e); },
    });
  }

  filtrar(valor: string): void {
    this.datos.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(reserva?: ReservaVista): void {
    this.dialog
      .open(ReservaFormDialogComponent, { width: '600px', data: reserva ?? null, disableClose: true })
      .afterClosed()
      .subscribe((guardado) => { if (guardado) this.cargar(); });
  }

  checkIn(r: ReservaVista): void {
    this.cambiarEstado(r, 'EN_CURSO', {
      titulo: 'Registrar check-in',
      mensaje: `¿Registrar el check-in de ${r.huesped?.nombre} en la habitación ${r.habitacion?.numero}?`,
      confirmar: 'Hacer check-in',
    }, 'Check-in registrado');
  }

  checkOut(r: ReservaVista): void {
    this.cambiarEstado(r, 'FINALIZADA', {
      titulo: 'Registrar check-out',
      mensaje: `¿Registrar el check-out? La habitación ${r.habitacion?.numero} pasará a limpieza.`,
      confirmar: 'Hacer check-out',
    }, 'Check-out registrado');
  }

  cancelar(r: ReservaVista): void {
    this.cambiarEstado(r, 'CANCELADA', {
      titulo: 'Cancelar reserva',
      mensaje: `¿Cancelar la reserva ${r.id}? La habitación ${r.habitacion?.numero} quedará disponible.`,
      confirmar: 'Cancelar reserva',
      peligro: true,
    }, 'Reserva cancelada');
  }

  eliminar(r: ReservaVista): void {
    ConfirmDialogComponent.abrir(this.dialog, {
      titulo: 'Eliminar reserva',
      mensaje: `¿Eliminar la reserva ${r.id}? Seguirá apareciendo en los reportes.`,
      confirmar: 'Eliminar',
      peligro: true,
    }).subscribe((ok) => {
      if (!ok) return;
      this.service.eliminar(r.id).subscribe({
        next: () => { this.notif.ok('Reserva eliminada'); this.cargar(); },
        error: (e) => this.notif.error(e),   // 409 si no está FINALIZADA o CANCELADA
      });
    });
  }

  private cambiarEstado(
    r: ReservaVista,
    destino: EstadoReserva,
    dialogo: { titulo: string; mensaje: string; confirmar: string; peligro?: boolean },
    exito: string,
  ): void {
    ConfirmDialogComponent.abrir(this.dialog, dialogo).subscribe((ok) => {
      if (!ok) return;
      this.service.cambiarEstado(r.id, codigoEstadoReserva(destino)).subscribe({
        next: () => { this.notif.ok(exito); this.cargar(); },
        error: (e) => { this.notif.error(e); this.cargar(); },   // 409 por transición inválida, 503 si una dependencia cayó
      });
    });
  }

  private aVista(r: Reserva): ReservaVista {
    const estadoClave = claveEstadoReserva(r.estadoReserva);
    return {
      ...r,
      estadoClave,
      estadoEtiqueta: etiquetaEstadoReserva(estadoClave, r.estadoReserva),
      tipoHabitacion: etiquetaTipoHabitacion(r.habitacion?.tipo),
      acciones: accionesReserva(estadoClave),
    };
  }
}
