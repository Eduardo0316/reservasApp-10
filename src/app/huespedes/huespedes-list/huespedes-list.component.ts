import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HuespedService } from '../huesped.service';
import { Huesped } from '../../shared/models/huesped.model';
import { NotificacionService } from '../../shared/services/notificacion.service';
import { PermisosService } from '../../shared/services/permisos.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { HuespedFormDialogComponent } from '../huesped-form-dialog/huesped-form-dialog.component';

@Component({
  selector: 'app-huespedes-list',
  standalone: false,
  templateUrl: './huespedes-list.component.html',
})
export class HuespedesListComponent implements OnInit {
  datos = new MatTableDataSource<Huesped>([]);
  cargando = true;

  constructor(
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
    this.service.listar().subscribe({
      next: (lista) => { this.datos.data = lista; this.cargando = false; },
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
