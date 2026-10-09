import { InicioHero } from '../../components/inicio-hero/inicio-hero';
import { CatalogoService } from '../../services/catalogo.service';
import { AvisoService } from '../../services/aviso.service';
import { Paginacion } from '../../components/paginacion/paginacion';
import { AvisoCard } from '../../components/aviso-card/aviso-card';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mensajeError } from '../../utils/mensaje-error';
import { Aviso } from '../../models/aviso.model';
import { Catalogo } from '../../models/catalogo.model';
import { Pagina } from '../../models/pagina.model';
import { Icon } from '../../components/icon/icon';
import { categoriaIcono } from '../../utils/categoria-icono';
@Component({
  selector: 'mz-avisos',
  imports: [InicioHero, Paginacion, AvisoCard, FormsModule, RouterLink, Icon],
  templateUrl: './avisos.html',
  styleUrl: './avisos.css',
})
export class AvisosPage {
  private catalogoService = inject(CatalogoService);
  private avisoService = inject(AvisoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  zonas = signal<Catalogo[]>([]);
  categorias = signal<Catalogo[]>([]);
  resultado = signal<Pagina<Aviso> | null>(null);
  cargando = signal(true);
  error = signal('');
  catalogError = signal('');
  filtros = {
    q: '',
    zonaId: '',
    categoriaId: '',
    estado: 'VIGENTES',
    desde: '',
    hasta: '',
    orden: 'desc',
  };
  pagina = 1;
  private solicitud = 0;
  icono = categoriaIcono;
  constructor() {
    void this.catalogos();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      for (const key of Object.keys(this.filtros) as (keyof typeof this.filtros)[])
        this.filtros[key] =
          params.get(key) ?? (key === 'estado' ? 'VIGENTES' : key === 'orden' ? 'desc' : '');
      this.pagina = Math.max(1, Number(params.get('page')) || 1);
      void this.cargar();
    });
  }
  async catalogos() {
    this.catalogError.set('');
    try {
      const [z, c] = await Promise.all([
        this.catalogoService.listar('zonas'),
        this.catalogoService.listar('categorias'),
      ]);
      this.zonas.set(z);
      this.categorias.set(c);
    } catch (e) {
      this.catalogError.set(mensajeError(e));
    }
  }
  async cargar() {
    const n = ++this.solicitud;
    this.cargando.set(true);
    this.error.set('');
    const params: Record<string, string | number> = { page: this.pagina, limit: 6 };
    Object.entries(this.filtros).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    try {
      const result = await this.avisoService.listar(params);
      if (n === this.solicitud) this.resultado.set(result);
    } catch (e) {
      if (n === this.solicitud) this.error.set(mensajeError(e));
    } finally {
      if (n === this.solicitud) this.cargando.set(false);
    }
  }
  buscar(page = 1) {
    void this.router.navigate([], { queryParams: { ...this.filtros, page }, replaceUrl: true });
  }
  limpiar() {
    this.filtros = {
      q: '',
      zonaId: '',
      categoriaId: '',
      estado: 'VIGENTES',
      desde: '',
      hasta: '',
      orden: 'desc',
    };
    this.buscar();
  }
  categoria(id: number | '') {
    this.filtros.categoriaId = String(id);
    this.buscar();
  }
}
