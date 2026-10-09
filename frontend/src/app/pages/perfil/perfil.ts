import { UsuarioService } from '../../services/usuario.service';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensajeError } from '../../utils/mensaje-error';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'mz-perfil',
  imports: [FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilPage {
  private usuarioService = inject(UsuarioService);
  auth = inject(AuthService);
  nombre = this.auth.usuario()?.nombre || '';
  actual = '';
  nueva = '';
  repetir = '';
  error = signal('');
  exito = signal('');
  ocupado = signal(false);
  async guardar() {
    if (this.ocupado()) return;
    this.error.set('');
    this.exito.set('');
    if (this.nueva !== this.repetir) {
      this.error.set('Las contraseñas nuevas no coinciden.');
      return;
    }
    this.ocupado.set(true);
    try {
      const body: Record<string, string> = { nombre: this.nombre };
      if (this.nueva) {
        body['passwordActual'] = this.actual;
        body['passwordNueva'] = this.nueva;
      }
      this.auth.usuario.set(await this.usuarioService.actualizarPerfil(body));
      this.actual = '';
      this.nueva = '';
      this.repetir = '';
      this.exito.set('Tu perfil se actualizó correctamente.');
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.ocupado.set(false);
    }
  }
}
