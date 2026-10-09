import { SuscripcionService } from '../../services/suscripcion.service';
import { CatalogoService } from '../../services/catalogo.service';
import { SelectorZonas } from '../../components/selector-zonas/selector-zonas';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensajeError } from '../../utils/mensaje-error';
import { Catalogo } from '../../models/catalogo.model';
import { Icon } from '../../components/icon/icon';
@Component({
  selector: 'mz-suscripcion',
  imports: [SelectorZonas, FormsModule, RouterLink, Icon],
  templateUrl: './suscripcion.html',
  styleUrl: './suscripcion.css',
})
export class SuscripcionPage {
  private suscripcionService = inject(SuscripcionService);
  private catalogoService = inject(CatalogoService);
  zonas = signal<Catalogo[]>([]);
  error = signal('');
  exito = signal('');
  cargando = signal(true);
  enviando = signal(false);
  email = '';
  seleccionadas: number[] = [];
  constructor() {
    void this.cargar();
  }
  async cargar() {
    this.error.set('');
    this.cargando.set(true);
    try {
      this.zonas.set(await this.catalogoService.listar('zonas'));
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  async enviar() {
    if (this.enviando()) return;
    this.enviando.set(true);
    this.error.set('');
    try {
      const r = await this.suscripcionService.suscribir({
        email: this.email,
        zonaIds: this.seleccionadas,
      });
      this.exito.set(r.mensaje);
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.enviando.set(false);
    }
  }
}
