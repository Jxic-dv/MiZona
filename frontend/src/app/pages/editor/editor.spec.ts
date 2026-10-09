import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EditorPage } from './editor';
import { fechaInput } from '../../utils/fecha';
import { authInterceptor } from '../../interceptors/auth.interceptor';

describe('EditorPage', () => {
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

  it('convierte las fechas a hora de Guatemala al editar y a UTC al publicar', async () => {
    expect(fechaInput('2099-01-01T16:00:00.000Z')).toBe('2099-01-01T10:00');
    const fixture = TestBed.createComponent(EditorPage);
    http.expectOne('/api/zonas').flush([{ id: 1, nombre: 'Zona 1' }]);
    http.expectOne('/api/categorias').flush([{ id: 1, nombre: 'Agua' }]);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.datos = {
      titulo: 'Corte de agua',
      descripcion: '',
      ubicacionDetalle: '',
      categoriaId: 1,
      zonaIds: [1],
      fechaInicio: '2099-01-01T10:00',
      fechaFinEstimada: '',
    };
    const guardar = page.guardar();
    const req = http.expectOne('/api/avisos');
    expect(req.request.body.fechaInicio).toBe('2099-01-01T16:00:00.000Z');
    expect(req.request.body.fechaFinEstimada).toBeNull();
    req.flush({ aviso: { id: 12 }, destinatarios: 1 });
    await guardar;
    expect(page.guardado()).toBe(12);
  });
});
