import { Component, input } from '@angular/core';
@Component({
  selector: 'mz-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class Icon {
  name = input('pin');
  paths: Record<string, string> = {
    pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM9 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
    water: 'M12 2S4 10 4 15a8 8 0 0 0 16 0c0-5-8-13-8-13ZM8 15c0 2 1 3 3 4',
    bolt: 'M13 2 3 14h8l-1 8 11-13h-8l1-7',
    road: 'M7 2 3 22M17 2l4 20M12 2v4m0 4v4m0 4v4',
    works: 'M3 20h18M5 16V9l7-6 7 6v7M9 16v-5h6v5',
    clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2',
    mail: 'M3 5h18v14H3ZM3 5l9 7 9-7',
    user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 22v-3a8 8 0 0 1 16 0v3',
    grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
    plus: 'M12 5v14M5 12h14',
    check: 'm5 12 4 4L19 6',
    close: 'm6 6 12 12M6 18 18 6',
    edit: 'm15 3 6 6M4 14 16 2l6 6-12 12-8 2Z',
    logout: 'M9 3H3v18h6M9 12h13m-5-5 5 5-5 5',
    shield: 'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6ZM8 12l3 3 5-6',
  };
}
