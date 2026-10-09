import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  get<T>(path: string, params: Record<string, string | number> = {}) {
    return firstValueFrom(this.http.get<T>(`/api/${path}`, { params }));
  }
  post<T>(path: string, body: unknown) {
    return firstValueFrom(this.http.post<T>(`/api/${path}`, body));
  }
  put<T>(path: string, body: unknown) {
    return firstValueFrom(this.http.put<T>(`/api/${path}`, body));
  }
  patch<T>(path: string, body: unknown) {
    return firstValueFrom(this.http.patch<T>(`/api/${path}`, body));
  }
  delete(path: string) {
    return firstValueFrom(this.http.delete<void>(`/api/${path}`));
  }
}
