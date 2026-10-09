import { AvisoService } from '../../services/aviso.service';
import { Paginacion } from '../../components/paginacion/paginacion';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensajeError } from '../../utils/mensaje-error';
import { AuthService } from '../../services/auth.service';
import { Aviso, estados } from '../../models/aviso.model';
import { Pagina } from '../../models/pagina.model';
import { fecha } from '../../utils/fecha';
import { Icon } from '../../components/icon/icon';
@Component({
  selector: 'mz-gestion-avisos',
  imports: [Paginacion, FormsModule, RouterLink, Icon],
  templateUrl: './gestion-avisos.html',
  styleUrl: './gestion-avisos.css',
})
export class GestionAvisosPage {
  private avisoService = inject(AvisoService);
  auth = inject(AuthService);
  resultado = signal<Pagina<Aviso> | null>(null);
  cargando = signal(true);
  ocupado = signal(false);
  error = signal('');
  exito = signal('');
  confirmacion = signal<{ aviso: Aviso; accion: string } | null>(null);
  q = '';
  estado = 'TODOS';
  page = 1;
  estados = estados;
  opciones = Object.keys(estados) as (keyof typeof estados)[];
  fecha = fecha;
  private solicitud = 0;
  constructor() {
    void this.cargar();
  }
  puede(a: Aviso) {
    return this.auth.usuario()?.rol === 'ADMIN' || a.creadoPor.id === this.auth.usuario()?.id;
  }
  pedir(aviso: Aviso, accion: string) {
    this.confirmacion.set({ aviso, accion });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async cargar() {
    const n = ++this.solicitud;
    this.cargando.set(true);
    this.error.set('');
    try {
      const r = await this.avisoService.listar({
        q: this.q,
        estado: this.estado,
        page: this.page,
        limit: 10,
      });
      if (n === this.solicitud) this.resultado.set(r);
    } catch (e) {
      if (n === this.solicitud) this.error.set(mensajeError(e));
    } finally {
      if (n === this.solicitud) this.cargando.set(false);
    }
  }
  async ejecutar() {
    const c = this.confirmacion();
    if (!c || this.ocupado()) return;
    this.ocupado.set(true);
    this.error.set('');
    this.exito.set('');
    try {
      if (c.accion === 'eliminar') await this.avisoService.eliminar(c.aviso.id);
      else if (c.accion === 'cancelar') await this.avisoService.cancelar(c.aviso.id);
      else await this.avisoService.finalizar(c.aviso.id);
      this.confirmacion.set(null);
      this.exito.set(
        'Aviso ' +
          (c.accion === 'eliminar'
            ? 'eliminado'
            : c.accion === 'cancelar'
              ? 'cancelado'
              : 'finalizado') +
          ' correctamente.',
      );
      await this.cargar();
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.ocupado.set(false);
    }
  }
}
