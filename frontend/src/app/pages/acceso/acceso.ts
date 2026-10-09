import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { mensajeError } from '../../utils/mensaje-error';
import { Icon } from '../../components/icon/icon';
@Component({
  selector: 'mz-acceso',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css',
})
export class AccesoPage {
  auth = inject(AuthService);
  private router = inject(Router);
  registro = signal(false);
  ocupado = signal(false);
  error = signal('');
  exito = signal('');
  nombre = '';
  email = '';
  password = '';
  mostrar = false;
  cambiar() {
    this.registro.update((v) => !v);
    this.error.set('');
    this.exito.set('');
    this.password = '';
  }
  async enviar() {
    if (this.ocupado()) return;
    this.ocupado.set(true);
    this.error.set('');
    this.exito.set('');
    try {
      if (this.registro()) {
        const r = await this.auth.registrar({
          nombre: this.nombre,
          email: this.email,
          password: this.password,
        });
        this.exito.set(r.mensaje);
        this.registro.set(false);
        this.password = '';
      } else {
        await this.auth.entrar(this.email, this.password);
        await this.router.navigateByUrl(
          this.auth.usuario()?.rol === 'ADMIN' ? '/panel/resumen' : '/panel/avisos',
        );
      }
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.ocupado.set(false);
    }
  }
}
