import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Icon } from '../../components/icon/icon';
@Component({
  selector: 'mz-panel',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class PanelPage {
  auth = inject(AuthService);
}
