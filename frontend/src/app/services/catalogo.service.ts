import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Catalogo, TipoCatalogo } from '../models/catalogo.model';
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private api = inject(ApiService);
  listar(tipo: TipoCatalogo) {
    return this.api.get<Catalogo[]>(tipo);
  }
  crear(tipo: TipoCatalogo, nombre: string) {
    return this.api.post<Catalogo>(tipo, { nombre });
  }
  actualizar(tipo: TipoCatalogo, id: number, nombre: string) {
    return this.api.put<Catalogo>(tipo + '/' + id, { nombre });
  }
  eliminar(tipo: TipoCatalogo, id: number) {
    return this.api.delete(tipo + '/' + id);
  }
}
