import { HttpInterceptorFn } from '@angular/common/http';
import { tokenKey } from '../services/auth.constants';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem(tokenKey);
  return next(
    token && req.url.startsWith('/api/')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req,
  );
};
