export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'FUNCIONARIO';
  activo: boolean;
  createdAt: string;
}
