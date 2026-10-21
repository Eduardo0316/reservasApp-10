import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HuespedService } from '../huesped.service';
import { Huesped, HuespedRequest } from '../../shared/models/huesped.model';
import { TIPOS_DOCUMENTO, normalizarTexto } from '../../shared/models/catalogos';
import { NotificacionService } from '../../shared/services/notificacion.service';
import { aplicarErroresAlFormulario } from '../../shared/utils/http-error';
import { mensajeError } from '../../shared/utils/form-errors';
import { longitudTrim, telefono10 } from '../../shared/utils/validadores';

@Component({
  selector: 'app-huesped-form-dialog',
  standalone: false,
  templateUrl: './huesped-form-dialog.component.html',
})
export class HuespedFormDialogComponent {
  readonly tiposDocumento = TIPOS_DOCUMENTO;
  readonly editando: boolean;
  /** En edición, si el servidor solo manda el nombre completo, pedimos confirmar nombre y apellido. */
  readonly pedirConfirmarNombre: boolean;
  guardando = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: HuespedService,
    private notif: NotificacionService,
    private ref: MatDialogRef<HuespedFormDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: Huesped | null,
  ) {
    this.editando = !!data;
    this.pedirConfirmarNombre = !!data && data.apellido === undefined;

    // Los nombres de los controles coinciden con los del DTO para poder pintar los errores 400 del servidor.
    this.form = this.fb.group({
      nombre:          [data?.nombre ?? '', longitudTrim(2, 50)],
      apellido:        [data?.apellido ?? '', longitudTrim(2, 50)],
      email:           [data?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefono:        [data?.telefono ?? '', [Validators.required, telefono10]],
      tipoDocumento:   [this.tipoDocumentoInicial(data?.tipoDocumento), Validators.required],
      numeroDocumento: [data?.numeroDocumento ?? '', longitudTrim(8, 20)],
      nacionalidad:    [data?.nacionalidad ?? '', longitudTrim(2, 50)],
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
    const request: HuespedRequest = {
      nombre: v.nombre.trim(),
      apellido: v.apellido.trim(),
      email: v.email.trim().toLowerCase(),
      telefono: v.telefono.trim(),
      tipoDocumento: v.tipoDocumento,
      numeroDocumento: v.numeroDocumento.trim(),
      nacionalidad: v.nacionalidad.trim(),
    };

    this.guardando = true;
    const peticion$ = this.editando
      ? this.service.actualizar(this.data!.id, request)
      : this.service.crear(request);

    peticion$.subscribe({
      next: () => {
        this.notif.ok(this.editando ? 'Huésped actualizado' : 'Huésped registrado');
        this.ref.close(true);
      },
      error: (e) => {
        this.guardando = false;
        if (aplicarErroresAlFormulario(this.form, e)) {
          this.notif.aviso('Revisa los campos marcados.');
        } else {
          this.notif.error(e);   // 409: duplicado entre ACTIVOS, etc.
        }
      },
    });
  }

  private tipoDocumentoInicial(valor?: string): string {
    if (!valor) return '';
    return TIPOS_DOCUMENTO.find(t => normalizarTexto(t) === normalizarTexto(valor)) ?? '';
  }
}
