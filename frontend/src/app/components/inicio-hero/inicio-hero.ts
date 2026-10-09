import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
@Component({
  selector: 'mz-inicio-hero',
  imports: [RouterLink, Icon],
  templateUrl: './inicio-hero.html',
  styleUrl: './inicio-hero.css',
})
export class InicioHero {}
