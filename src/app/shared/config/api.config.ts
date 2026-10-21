import { environment } from '../../../environments/environment';

/** Todas las peticiones pasan por el Gateway (requerimiento 2.3). */
const base = environment.gatewayUrl;

export const API = {
  huespedes: `${base}/api/huespedes`,
  habitaciones: `${base}/api/habitaciones`,
  reservas: `${base}/api/reservas`,
};
