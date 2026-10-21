import { Injectable } from '@angular/core';
// ⚠️ AJUSTA estas dos rutas a las de tu proyecto (son lo único del frontend actual que se usa aquí)
import { AuthService } from '../../core/services/auth.service';
import { ROLES } from '../../core/models/usuario.model';

/** Punto único para preguntar por el rol. Los componentes nuevos no dependen de AuthService/ROLES directamente. */
@Injectable({ providedIn: 'root' })
export class PermisosService {
  constructor(private auth: AuthService) {}

  get esAdmin(): boolean {
    return this.auth.hasRole(ROLES[0]);
  }
}
