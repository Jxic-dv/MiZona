import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Aviso, estados } from '../../models/aviso.model';
import { fecha } from '../../utils/fecha';
import { categoriaIcono } from '../../utils/categoria-icono';
import { Icon } from '../icon/icon';
@Component({
  selector: 'mz-aviso-card',
  imports: [RouterLink, Icon],
  templateUrl: './aviso-card.html',
  styleUrl: './aviso-card.css',
})
export class AvisoCard {
  aviso = input.required<Aviso>();
  estados = estados;
  fecha = fecha;
  icono = categoriaIcono;
}
