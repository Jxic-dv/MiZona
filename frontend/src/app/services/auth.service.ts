import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { tokenKey } from './auth.constants';
import { Usuario } from '../models/usuario.model';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  usuario = signal<Usuario | null>(null);
  async restaurar() {
    if (!sessionStorage.getItem(tokenKey)) return;
    try {
      this.usuario.set(await this.api.get<Usuario>('usuarios/me'));
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) this.salir();
    }
  }
  registrar(datos: { nombre: string; email: string; password: string }) {
    return this.api.post<{ mensaje: string }>('auth/register', datos);
  }
  async entrar(email: string, password: string) {
    const data = await this.api.post<{ token: string; usuario: Usuario }>('auth/login', {
      email,
      password,
    });
    sessionStorage.setItem(tokenKey, data.token);
    this.usuario.set(data.usuario);
  }
  salir() {
    sessionStorage.removeItem(tokenKey);
    this.usuario.set(null);
    void this.router.navigateByUrl('/acceso');
  }
}
