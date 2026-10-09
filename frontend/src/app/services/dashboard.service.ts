import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Resumen } from '../models/dashboard.model';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);
  obtener() {
    return this.api.get<Resumen>('dashboard');
  }
}
