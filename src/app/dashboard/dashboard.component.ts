import { ROLES } from '../core/models/usuario.model';
import { Component, OnInit } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { UsuarioService } from '../usuarios/usuario.service';
import { AuthService } from '../core/services/auth.service';
import { ReservaService } from '../reservas/reserva.service';
import { HabitacionService } from '../habitaciones/habitacion.service';
import { HuespedService } from '../huespedes/huesped.service';
import { claveEstadoHabitacion, claveEstadoReserva } from '../shared/models/catalogos';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  // null = no se pudo cargar (se muestra "—")
  reservasActivas: number | null = null;
  habitacionesDisponibles: number | null = null;
  totalHuespedes: number | null = null;
  totalUsuarios: number | null = null;

  cargando = true;
  isAdmin = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private reservaService: ReservaService,
    private habitacionService: HabitacionService,
    private huespedService: HuespedService,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);

    forkJoin({
      reservas: this.reservaService.listar().pipe(catchError(() => of(null))),
      habitaciones: this.habitacionService.listar().pipe(catchError(() => of(null))),
      huespedes: this.huespedService.listar().pipe(catchError(() => of(null))),
      usuarios: this.isAdmin ? this.usuarioService.listar().pipe(catchError(() => of(null))) : of(null),
    }).subscribe(({ reservas, habitaciones, huespedes, usuarios }) => {
      this.reservasActivas = reservas
        ? reservas.filter(r => ['CONFIRMADA', 'EN_CURSO'].includes(claveEstadoReserva(r.estadoReserva) ?? '')).length
        : null;
      this.habitacionesDisponibles = habitaciones
        ? habitaciones.filter(h => claveEstadoHabitacion(h.estado) === 'DISPONIBLE').length
        : null;
      this.totalHuespedes = huespedes ? huespedes.length : null;
      this.totalUsuarios = usuarios ? usuarios.length : null;
      this.cargando = false;
    });
  }
}
