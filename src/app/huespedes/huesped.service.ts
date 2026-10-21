import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../shared/config/api.config';
import { Huesped, HuespedRequest } from '../shared/models/huesped.model';

@Injectable({ providedIn: 'root' })
export class HuespedService {
  private readonly url = API.huespedes;

  constructor(private http: HttpClient) {}

  listar(): Observable<Huesped[]> {
    return this.http.get<Huesped[]>(this.url);
  }

  obtener(id: number): Observable<Huesped> {
    return this.http.get<Huesped>(`${this.url}/${id}`);
  }

  crear(request: HuespedRequest): Observable<Huesped> {
    return this.http.post<Huesped>(this.url, request);
  }

  actualizar(id: number, request: HuespedRequest): Observable<Huesped> {
    return this.http.put<Huesped>(`${this.url}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
