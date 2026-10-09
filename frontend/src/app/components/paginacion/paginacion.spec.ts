import { TestBed } from '@angular/core/testing';
import { Paginacion } from './paginacion';

describe('Paginacion', () => {
  it('emite la página solicitada y desactiva navegación fuera de los límites', async () => {
    const fixture = TestBed.createComponent(Paginacion);
    fixture.componentRef.setInput('pagina', 1);
    fixture.componentRef.setInput('totalPaginas', 2);
    const cambios: number[] = [];
    fixture.componentInstance.cambio.subscribe((pagina) => cambios.push(pagina));
    await fixture.whenStable();
    const botones = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(botones[0].disabled).toBe(true);
    botones[1].click();
    expect(cambios).toEqual([2]);
    fixture.componentRef.setInput('pagina', 2);
    await fixture.whenStable();
    expect(botones[1].disabled).toBe(true);
    fixture.componentInstance.ir(3);
    expect(cambios).toEqual([2]);
  });
});
