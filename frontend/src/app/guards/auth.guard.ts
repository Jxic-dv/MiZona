import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const autenticado: CanActivateFn = async () => {
  const auth = inject(AuthService),
    router = inject(Router);
  await auth.restaurar();
  return auth.usuario() ? true : router.parseUrl('/acceso');
};
