import { UsuarioService } from '../../services/usuario.service';
import { Paginacion } from '../../components/paginacion/paginacion';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensajeError } from '../../utils/mensaje-error';
import { AuthService } from '../../services/auth.service';
import { Pagina } from '../../models/pagina.model';
import { Usuario } from '../../models/usuario.model';
@Component({
  selector: 'mz-usuarios',
  imports: [Paginacion, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosPage {
  private usuarioService = inject(UsuarioService);
  auth = inject(AuthService);
  resultado = signal<Pagina<Usuario> | null>(null);
  error = signal('');
  exito = signal('');
  cargando = signal(true);
  ocupado = signal(false);
  confirmar = signal<Usuario | null>(null);
  q = '';
  activo = '';
  page = 1;
  private solicitud = 0;
  constructor() {
    void this.cargar();
  }
  async cargar() {
    const n = ++this.solicitud;
    this.error.set('');
    this.cargando.set(true);
    try {
      const params: Record<string, string | number> = { q: this.q, page: this.page, limit: 10 };
      if (this.activo) params['activo'] = this.activo;
      const r = await this.usuarioService.listar(params);
      if (n === this.solicitud) this.resultado.set(r);
    } catch (e) {
      if (n === this.solicitud) this.error.set(mensajeError(e));
    } finally {
      if (n === this.solicitud) this.cargando.set(false);
    }
  }
  async cambiar() {
    const u = this.confirmar();
    if (!u || this.ocupado()) return;
    this.ocupado.set(true);
    this.error.set('');
    try {
      await this.usuarioService.cambiarActivo(u.id, !u.activo);
      this.confirmar.set(null);
      this.exito.set('Estado de la cuenta actualizado.');
      await this.cargar();
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.ocupado.set(false);
    }
  }
}
