import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SuscripcionPage } from './suscripcion';
import { authInterceptor } from '../../interceptors/auth.interceptor';

describe('SuscripcionPage', () => {
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

  it('suscribe únicamente las zonas seleccionadas y muestra la confirmación', async () => {
    const fixture = TestBed.createComponent(SuscripcionPage);
    http.expectOne('/api/zonas').flush([
      { id: 1, nombre: 'Zona 1' },
      { id: 2, nombre: 'Zona 2' },
    ]);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.email = 'vecino@example.com';
    const checks = fixture.nativeElement.querySelectorAll(
      'input[type="checkbox"]',
    ) as NodeListOf<HTMLInputElement>;
    checks[0].click();
    checks[1].click();
    checks[0].click();
    await fixture.whenStable();
    const envio = page.enviar();
    const req = http.expectOne('/api/suscripciones');
    expect(req.request.body).toEqual({ email: 'vecino@example.com', zonaIds: [2] });
    req.flush({ mensaje: 'Confirma tu suscripción desde el correo.' });
    await envio;
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Revisa tu correo');
  });
});
