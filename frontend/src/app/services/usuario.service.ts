import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Usuario } from '../models/usuario.model';
import { Pagina } from '../models/pagina.model';
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private api = inject(ApiService);
  listar(filtros: Record<string, string | number>) {
    return this.api.get<Pagina<Usuario>>('usuarios', filtros);
  }
  cambiarActivo(id: number, activo: boolean) {
    return this.api.patch<Usuario>('usuarios/' + id + '/activo', { activo });
  }
  actualizarPerfil(datos: { nombre?: string; passwordActual?: string; passwordNueva?: string }) {
    return this.api.put<Usuario>('usuarios/me', datos);
  }
}
