import { CatalogoService } from '../../services/catalogo.service';
import { AvisoService } from '../../services/aviso.service';
import { SelectorZonas } from '../../components/selector-zonas/selector-zonas';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { mensajeError } from '../../utils/mensaje-error';
import { AuthService } from '../../services/auth.service';
import { Catalogo } from '../../models/catalogo.model';
import { fechaInput } from '../../utils/fecha';
import { Icon } from '../../components/icon/icon';
@Component({
  selector: 'mz-editor',
  imports: [SelectorZonas, FormsModule, RouterLink, Icon],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
})
export class EditorPage {
  private catalogoService = inject(CatalogoService);
  private avisoService = inject(AvisoService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  id = this.route.snapshot.paramMap.get('id');
  zonas = signal<Catalogo[]>([]);
  categorias = signal<Catalogo[]>([]);
  error = signal('');
  exito = signal('');
  cargando = signal(true);
  ocupado = signal(false);
  permitido = signal(true);
  guardado = signal<number | null>(null);
  datos = {
    titulo: '',
    descripcion: '',
    ubicacionDetalle: '',
    categoriaId: 0,
    zonaIds: [] as number[],
    fechaInicio: '',
    fechaFinEstimada: '',
  };
  constructor() {
    void this.cargar();
  }
  async cargar() {
    this.cargando.set(true);
    this.error.set('');
    try {
      const [z, c, a] = await Promise.all([
        this.catalogoService.listar('zonas'),
        this.catalogoService.listar('categorias'),
        this.id ? this.avisoService.obtener(this.id) : Promise.resolve(null),
      ]);
      this.zonas.set(z);
      this.categorias.set(c);
      if (a) {
        if (
          (this.auth.usuario()?.rol !== 'ADMIN' && a.creadoPor.id !== this.auth.usuario()?.id) ||
          a.estado === 'CANCELADO' ||
          a.estado === 'FINALIZADO'
        ) {
          this.permitido.set(false);
          throw new Error(
            'No puedes editar este aviso. Debe estar vigente y pertenecer a tu cuenta, salvo que seas administrador.',
          );
        }
        this.datos = {
          titulo: a.titulo,
          descripcion: a.descripcion || '',
          ubicacionDetalle: a.ubicacionDetalle || '',
          categoriaId: a.categoria.id,
          zonaIds: a.zonas.map((z) => z.id),
          fechaInicio: fechaInput(a.fechaInicio),
          fechaFinEstimada: a.fechaFinEstimada ? fechaInput(a.fechaFinEstimada) : '',
        };
      }
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  async guardar() {
    if (this.ocupado()) return;
    this.error.set('');
    const inicio = new Date(this.datos.fechaInicio + '-06:00');
    const fin = this.datos.fechaFinEstimada
      ? new Date(this.datos.fechaFinEstimada + '-06:00')
      : null;
    if (
      Number.isNaN(inicio.getTime()) ||
      (fin && (Number.isNaN(fin.getTime()) || fin <= inicio || fin.getTime() <= Date.now()))
    ) {
      this.error.set(
        'Revisa las fechas: el fin debe ser posterior al inicio y estar en el futuro.',
      );
      return;
    }
    this.ocupado.set(true);
    try {
      const datos = {
        ...this.datos,
        fechaInicio: inicio.toISOString(),
        fechaFinEstimada: fin?.toISOString() ?? null,
      };
      const r = this.id
        ? await this.avisoService.actualizar(this.id, datos)
        : await this.avisoService.crear(datos);
      this.guardado.set(r.aviso.id);
      this.exito.set(
        'Aviso ' +
          (this.id ? 'actualizado' : 'publicado') +
          '. Destinatarios de la notificación: ' +
          r.destinatarios +
          '.',
      );
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.ocupado.set(false);
    }
  }
}
