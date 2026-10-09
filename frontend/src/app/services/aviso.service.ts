import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Aviso, DatosAviso, ResultadoAviso } from '../models/aviso.model';
import { Pagina } from '../models/pagina.model';
@Injectable({ providedIn: 'root' })
export class AvisoService {
  private api = inject(ApiService);
  listar(filtros: Record<string, string | number>) {
    return this.api.get<Pagina<Aviso>>('avisos', filtros);
  }
  obtener(id: string | number) {
    return this.api.get<Aviso>('avisos/' + id);
  }
  crear(datos: DatosAviso) {
    return this.api.post<ResultadoAviso>('avisos', datos);
  }
  actualizar(id: string | number, datos: DatosAviso) {
    return this.api.put<ResultadoAviso>('avisos/' + id, datos);
  }
  cancelar(id: number) {
    return this.api.post<ResultadoAviso>('avisos/' + id + '/cancelar', {});
  }
  finalizar(id: number) {
    return this.api.post<Aviso>('avisos/' + id + '/finalizar', {});
  }
  eliminar(id: number) {
    return this.api.delete('avisos/' + id);
  }
}
