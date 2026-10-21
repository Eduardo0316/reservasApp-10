import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../shared/config/api.config';
import { Habitacion, HabitacionRequest } from '../shared/models/habitacion.model';

@Injectable({ providedIn: 'root' })
export class HabitacionService {
  private readonly url = API.habitaciones;

  constructor(private http: HttpClient) {}

  listar(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.url);
  }

  crear(request: HabitacionRequest): Observable<Habitacion> {
    return this.http.post<Habitacion>(this.url, request);
  }

  /** PUT: el backend ignora cualquier estado; solo cambia número, tipo, precio y capacidad. */
  actualizar(id: number, request: HabitacionRequest): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.url}/${id}`, request);
  }

  /** PATCH /{id}/estado/{idEstado} - solo ADMIN, solo entre DISPONIBLE, LIMPIEZA y MANTENIMIENTO. */
  cambiarEstado(id: number, codigoEstado: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/estado/${codigoEstado}`, null);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
