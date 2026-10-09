import { Component, input, output } from '@angular/core';
@Component({
  selector: 'mz-paginacion',
  templateUrl: './paginacion.html',
  styleUrl: './paginacion.css',
})
export class Paginacion {
  pagina = input.required<number>();
  totalPaginas = input.required<number>();
  cambio = output<number>();
  ir(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) this.cambio.emit(pagina);
  }
}
