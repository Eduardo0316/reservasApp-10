import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HabitacionService } from '../habitacion.service';
import { Habitacion, HabitacionRequest } from '../../shared/models/habitacion.model';
import { TIPOS_HABITACION, codigoTipoHabitacion } from '../../shared/models/catalogos';
import { NotificacionService } from '../../shared/services/notificacion.service';
import { aplicarErroresAlFormulario } from '../../shared/utils/http-error';
import { mensajeError } from '../../shared/utils/form-errors';
import { enteroMayorQueCero, mayorQueCero } from '../../shared/utils/validadores';

@Component({
  selector: 'app-habitacion-form-dialog',
  standalone: false,
  templateUrl: './habitacion-form-dialog.component.html',
})
export class HabitacionFormDialogComponent {
  readonly tipos = TIPOS_HABITACION;
  readonly editando: boolean;
  guardando = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: HabitacionService,
    private notif: NotificacionService,
    private ref: MatDialogRef<HabitacionFormDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: Habitacion | null,
  ) {
    this.editando = !!data;
    this.form = this.fb.group({
      numero:    [data?.numero ?? null, [Validators.required, enteroMayorQueCero]],
      idTipo:    [data ? codigoTipoHabitacion(data.tipo) : null, Validators.required],
      precio:    [data?.precio ?? null, [Validators.required, mayorQueCero]],
      capacidad: [data?.capacidad ?? null, [Validators.required, enteroMayorQueCero]],
    });
  }

  err(campo: string): string {
    return mensajeError(this.form.get(campo));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const request: HabitacionRequest = {
      numero: Number(v.numero),
      idTipo: Number(v.idTipo),
      precio: Number(v.precio),
      capacidad: Number(v.capacidad),
    };

    this.guardando = true;
    const peticion$ = this.editando
      ? this.service.actualizar(this.data!.id, request)
      : this.service.crear(request);

    peticion$.subscribe({
      next: () => {
        this.notif.ok(this.editando ? 'Habitación actualizada' : 'Habitación creada');
        this.ref.close(true);
      },
      error: (e) => {
        this.guardando = false;
        if (aplicarErroresAlFormulario(this.form, e)) {
          this.notif.aviso('Revisa los campos marcados.');
        } else {
          this.notif.error(e);   // 409: número duplicado, capacidad menor a la reserva vigente
        }
      },
    });
  }
}
