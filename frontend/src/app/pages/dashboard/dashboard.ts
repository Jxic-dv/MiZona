import { DashboardService } from '../../services/dashboard.service';
import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensajeError } from '../../utils/mensaje-error';
import { AuthService } from '../../services/auth.service';
import { Resumen } from '../../models/dashboard.model';
import { estados } from '../../models/aviso.model';
import { Icon } from '../../components/icon/icon';
@Component({
  selector: 'mz-dashboard',
  imports: [RouterLink, Icon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage {
  private dashboardService = inject(DashboardService);
  auth = inject(AuthService);
  resumen = signal<Resumen | null>(null);
  error = signal('');
  cargando = signal(true);
  estados = estados;
  opciones = Object.keys(estados) as (keyof typeof estados)[];
  maxCategoria = computed(() =>
    Math.max(1, ...(this.resumen()?.avisosPorCategoria.map((c) => c.total) || [])),
  );
  constructor() {
    void this.cargar();
  }
  async cargar() {
    this.cargando.set(true);
    this.error.set('');
    try {
      this.resumen.set(await this.dashboardService.obtener());
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.cargando.set(false);
    }
  }
}
