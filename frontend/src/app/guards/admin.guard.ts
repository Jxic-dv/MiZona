import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const administrador: CanActivateFn = async () => {
  const auth = inject(AuthService),
    router = inject(Router);
  await auth.restaurar();
  return auth.usuario()?.rol === 'ADMIN' ? true : router.parseUrl('/panel/avisos');
};
