import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../reservas/reserva.service';
import { Reserva } from '../shared/models/reserva.model';
import { ESTADOS_RESERVA } from '../shared/models/catalogos';
import { NotificacionService } from '../shared/services/notificacion.service';

interface GrupoEstado {
  clave: string;
  etiqueta: string;
  reservas: Reserva[];
}

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.component.html',
})
export class ReportesComponent implements OnInit {
  historico: Reserva[] = [];
  grupos: GrupoEstado[] = [];
  cargandoHistorico = true;
  cargandoGrupos = true;

  constructor(private service: ReservaService, private notif: NotificacionService) {}

  /** True si el backend ya envía estadoRegistro (necesario para identificar las ELIMINADAS). */
  get distingueEliminadas(): boolean {
    return this.historico.some(r => !!r.estadoRegistro);
  }

  ngOnInit(): void {
    this.service.reporteHistorico().subscribe({
      next: (lista) => { this.historico = lista; this.cargandoHistorico = false; },
      error: (e) => { this.cargandoHistorico = false; this.notif.error(e); },   // 403 si no es ADMIN
    });

    // Una consulta por estado (el endpoint recibe un solo código)
    forkJoin(ESTADOS_RESERVA.map(e => this.service.reportePorEstado(e.codigo))).subscribe({
      next: (resultados) => {
        this.grupos = ESTADOS_RESERVA.map((e, i) => ({ clave: e.clave, etiqueta: e.etiqueta, reservas: resultados[i] }));
        this.cargandoGrupos = false;
      },
      error: (e) => { this.cargandoGrupos = false; this.notif.error(e); },
    });
  }
}
