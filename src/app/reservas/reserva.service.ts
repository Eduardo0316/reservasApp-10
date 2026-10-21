import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API } from '../shared/config/api.config';
import {
  Page, Reserva, ReservaActualizarRequest, ReservaCrearRequest,
} from '../shared/models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly url = API.reservas;

  constructor(private http: HttpClient) {}

  listar(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.url);
  }

  crear(request: ReservaCrearRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.url, request);
  }

  /** Solo fechas. El precioTotal lo recalcula el backend. */
  actualizar(id: number, request: ReservaActualizarRequest): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.url}/${id}`, request);
  }

  /** PATCH /{idReserva}/estado/{idEstado}: 2 = check-in, 3 = check-out, 4 = cancelación. */
  cambiarEstado(id: number, codigoEstado: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/estado/${codigoEstado}`, null);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // ───────────── Reportes (solo ADMIN) ─────────────

  reporteHistorico(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.url}/reportes/historico`);
  }

  /**
   * El endpoint actual es paginado y recibe un solo estado.
   * Se pide una página grande (el alcance excluye paginación) y se devuelve solo el contenido.
   */
  reportePorEstado(codigoEstado: number): Observable<Reserva[]> {
    const params = new HttpParams().set('codigoEstadoReserva', codigoEstado).set('size', 1000);
    return this.http
      .get<Page<Reserva>>(`${this.url}/reportes/por-estado`, { params })
      .pipe(map((p) => p.content ?? []));
  }
}
