import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { tokenKey } from './auth.constants';
import { authInterceptor } from '../interceptors/auth.interceptor';

describe('AuthService', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('guarda la sesión y adjunta el token en solicitudes a la API', async () => {
    const auth = TestBed.inject(AuthService);
    const usuario = { id: 1, nombre: 'Ana', rol: 'ADMIN', activo: true };
    const login = auth.entrar('ana@example.com', 'Prueba12345');
    http.expectOne('/api/auth/login').flush({ token: 'token-prueba', usuario });
    await login;
    expect(auth.usuario()?.nombre).toBe('Ana');
    const perfil = TestBed.inject(ApiService).get('usuarios/me');
    const req = http.expectOne('/api/usuarios/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-prueba');
    req.flush(usuario);
    await perfil;
  });

  it('elimina la sesión si el backend rechaza una cuenta desactivada', async () => {
    sessionStorage.setItem(tokenKey, 'token-viejo');
    const auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const restauracion = auth.restaurar();
    http
      .expectOne('/api/usuarios/me')
      .flush({ error: 'Tu cuenta no está activa' }, { status: 401, statusText: 'Unauthorized' });
    await restauracion;
    expect(auth.usuario()).toBeNull();
    expect(sessionStorage.getItem(tokenKey)).toBeNull();
  });
});
