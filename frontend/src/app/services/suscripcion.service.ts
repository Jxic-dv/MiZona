import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
@Injectable({ providedIn: 'root' })
export class SuscripcionService {
  private api = inject(ApiService);
  suscribir(datos: { email: string; zonaIds: number[] }) {
    return this.api.post<{ mensaje: string }>('suscripciones', datos);
  }
}
