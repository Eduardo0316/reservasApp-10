import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../reserva.service';
import { HuespedService } from '../../huespedes/huesped.service';
import { HabitacionService } from '../../habitaciones/habitacion.service';
import { Reserva } from '../../shared/models/reserva.model';
import { Huesped } from '../../shared/models/huesped.model';
import { Habitacion } from '../../shared/models/habitacion.model';
import {
  EstadoReserva, claveEstadoHabitacion, claveEstadoReserva, etiquetaEstadoReserva, etiquetaTipoHabitacion,
} from '../../shared/models/catalogos';
import { NotificacionService } from '../../shared/services/notificacion.service';
import { aplicarErroresAlFormulario } from '../../shared/utils/http-error';
import { mensajeError } from '../../shared/utils/form-errors';
import { enteroMayorQueCero, fechasOrdenadas } from '../../shared/utils/validadores';
import { aIso, desdeIso } from '../../shared/utils/fechas';

/** Un solo diálogo para crear (data = null) y para editar fechas (data = reserva). */
@Component({
  selector: 'app-reserva-form-dialog',
  standalone: false,
  templateUrl: './reserva-form-dialog.component.html',
})
export class ReservaFormDialogComponent implements OnInit {
  readonly editando: boolean;
  readonly estadoClave: EstadoReserva | null;
  readonly estadoEtiqueta: string;
  /** Tras el check-in solo se puede cambiar la fecha de salida. */
  readonly soloSalida: boolean;

  form: FormGroup;
  huespedes: Huesped[] = [];
  habitaciones: Habitacion[] = [];
  cargandoCatalogos = false;
  capacidadSeleccionada: number | null = null;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private reservas: ReservaService,
    private huespedesSrv: HuespedService,
    private habitacionesSrv: HabitacionService,
    private notif: NotificacionService,
    private ref: MatDialogRef<ReservaFormDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: Reserva | null,
  ) {
    this.editando = !!data;
    this.estadoClave = data ? claveEstadoReserva(data.estadoReserva) : null;
    this.estadoEtiqueta = data ? etiquetaEstadoReserva(this.estadoClave, data.estadoReserva) : '';
    this.soloSalida = this.estadoClave === 'EN_CURSO';

    this.form = this.editando
      ? this.fb.group(
          {
            fechaEntrada: [desdeIso(data!.fechaEntrada), Validators.required],
            fechaSalida:  [desdeIso(data!.fechaSalida), Validators.required],
          },
          { validators: fechasOrdenadas },
        )
      : this.fb.group(
          {
            idHuesped:      [null, Validators.required],
            idHabitacion:   [null, Validators.required],
            fechaEntrada:   [null, Validators.required],
            fechaSalida:    [null, Validators.required],
            numeroPersonas: [1, [Validators.required, enteroMayorQueCero]],
          },
          { validators: fechasOrdenadas },
        );

    if (this.soloSalida) this.form.get('fechaEntrada')!.disable();
  }

  ngOnInit(): void {
    if (this.editando) return;

    this.cargandoCatalogos = true;
    forkJoin({
      huespedes: this.huespedesSrv.listar(),
      habitaciones: this.habitacionesSrv.listar(),
    }).subscribe({
      next: ({ huespedes, habitaciones }) => {
        this.huespedes = huespedes;
        // Solo se ofrecen las DISPONIBLES (la regla real la valida el backend con 409)
        this.habitaciones = habitaciones.filter(h => claveEstadoHabitacion(h.estado) === 'DISPONIBLE');
        this.cargandoCatalogos = false;
      },
      error: (e) => { this.cargandoCatalogos = false; this.notif.error(e); },
    });

    // numeroPersonas: entre 1 y la capacidad de la habitación elegida
    this.form.get('idHabitacion')!.valueChanges.subscribe((id) => {
      const hab = this.habitaciones.find(h => h.id === id);
      this.capacidadSeleccionada = hab?.capacidad ?? null;
      const personas = this.form.get('numeroPersonas')!;
      personas.setValidators([
        Validators.required,
        enteroMayorQueCero,
        ...(hab ? [Validators.max(hab.capacidad)] : []),
      ]);
      personas.updateValueAndValidity();
    });
  }

  err(campo: string): string {
    return mensajeError(this.form.get(campo));
  }

  etiquetaHabitacion(h: Habitacion): string {
    return `Hab. ${h.numero} · ${etiquetaTipoHabitacion(h.tipo)} · capacidad ${h.capacidad}`;
  }

  etiquetaHuesped(h: Huesped): string {
    return `${h.nombre} · ${h.tipoDocumento} ${h.numeroDocumento}`;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando = true;

    const peticion$ = this.editando
      ? this.reservas.actualizar(this.data!.id, { fechaEntrada: aIso(v.fechaEntrada), fechaSalida: aIso(v.fechaSalida) })
      : this.reservas.crear({
          idHuesped: Number(v.idHuesped),
          idHabitacion: Number(v.idHabitacion),
          fechaEntrada: aIso(v.fechaEntrada),
          fechaSalida: aIso(v.fechaSalida),
          numeroPersonas: Number(v.numeroPersonas),
          // TODO: el DTO del backend exige codigoReserva aunque no está en los requerimientos.
          // Cuando lo quiten del backend, borra esta línea.
          codigoReserva: Date.now(),
        });

    peticion$.subscribe({
      next: () => {
        this.notif.ok(this.editando ? 'Reserva actualizada' : 'Reserva creada');
        this.ref.close(true);
      },
      error: (e) => {
        this.guardando = false;
        if (aplicarErroresAlFormulario(this.form, e)) {
          this.notif.aviso('Revisa los campos marcados.');
        } else {
          this.notif.error(e);   // 404 huésped/habitación, 409 regla de negocio, 503 dependencia caída
        }
      },
    });
  }
}
