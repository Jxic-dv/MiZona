import { Component, input, model } from '@angular/core';
import { Catalogo } from '../../models/catalogo.model';
@Component({
  selector: 'mz-selector-zonas',
  templateUrl: './selector-zonas.html',
  styleUrl: './selector-zonas.css',
})
export class SelectorZonas {
  zonas = input.required<Catalogo[]>();
  seleccionadas = model<number[]>([]);
  columnas = input(4);
  toggle(id: number) {
    this.seleccionadas.update((ids) =>
      ids.includes(id) ? ids.filter((z) => z !== id) : [...ids, id],
    );
  }
}
