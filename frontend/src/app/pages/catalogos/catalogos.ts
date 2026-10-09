import { CatalogoService } from '../../services/catalogo.service';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mensajeError } from '../../utils/mensaje-error';
import { Catalogo, TipoCatalogo } from '../../models/catalogo.model';
import { Icon } from '../../components/icon/icon';
@Component({
  selector: 'mz-catalogos',
  imports: [FormsModule, Icon],
  templateUrl: './catalogos.html',
  styleUrl: './catalogos.css',
})
export class CatalogosPage {
  private catalogoService = inject(CatalogoService);
  private route = inject(ActivatedRoute);
  tipo: TipoCatalogo = 'zonas';
  items = signal<Catalogo[]>([]);
  error = signal('');
  exito = signal('');
  cargando = signal(true);
  ocupado = signal(false);
  eliminando = signal<Catalogo | null>(null);
  nombre = '';
  editando: number | null = null;
  private solicitud = 0;
  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((d) => {
      this.tipo = d['tipo'];
      this.limpiar();
      this.eliminando.set(null);
      this.exito.set('');
      void this.cargar();
    });
  }
  limpiar() {
    this.nombre = '';
    this.editando = null;
  }
  editar(c: Catalogo) {
    this.editando = c.id;
    this.nombre = c.nombre;
    this.error.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async cargar() {
    const n = ++this.solicitud;
    this.error.set('');
    this.cargando.set(true);
    try {
      const items = await this.catalogoService.listar(this.tipo);
      if (n === this.solicitud) this.items.set(items);
    } catch (e) {
      if (n === this.solicitud) this.error.set(mensajeError(e));
    } finally {
      if (n === this.solicitud) this.cargando.set(false);
    }
  }
  async guardar() {
    if (this.ocupado()) return;
    this.ocupado.set(true);
    this.error.set('');
    this.exito.set('');
    try {
      if (this.editando)
        await this.catalogoService.actualizar(this.tipo, this.editando, this.nombre);
      else await this.catalogoService.crear(this.tipo, this.nombre);
      this.limpiar();
      this.exito.set('Catálogo actualizado.');
      await this.cargar();
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.ocupado.set(false);
    }
  }
  async eliminar() {
    const c = this.eliminando();
    if (!c || this.ocupado()) return;
    this.ocupado.set(true);
    this.error.set('');
    try {
      await this.catalogoService.eliminar(this.tipo, c.id);
      this.eliminando.set(null);
      if (this.editando === c.id) this.limpiar();
      this.exito.set('Registro eliminado.');
      await this.cargar();
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.ocupado.set(false);
    }
  }
}
