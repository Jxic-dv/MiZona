import { AvisoService } from '../../services/aviso.service';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mensajeError } from '../../utils/mensaje-error';
import { Aviso, estados } from '../../models/aviso.model';
import { fecha } from '../../utils/fecha';
import { Icon } from '../../components/icon/icon';
import { categoriaIcono } from '../../utils/categoria-icono';
@Component({
  selector: 'mz-detalle',
  imports: [RouterLink, Icon],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class DetallePage {
  private avisoService = inject(AvisoService);
  private route = inject(ActivatedRoute);
  id = '';
  private solicitud = 0;
  aviso = signal<Aviso | null>(null);
  error = signal('');
  cargando = signal(true);
  estados = estados;
  fecha = fecha;
  icono = categoriaIcono;
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      this.id = p.get('id') || '';
      void this.cargar();
    });
  }
  async cargar() {
    const n = ++this.solicitud;
    this.cargando.set(true);
    this.error.set('');
    try {
      const a = await this.avisoService.obtener(this.id);
      if (n === this.solicitud) this.aviso.set(a);
    } catch (e) {
      if (n === this.solicitud) this.error.set(mensajeError(e));
    } finally {
      if (n === this.solicitud) this.cargando.set(false);
    }
  }
}
