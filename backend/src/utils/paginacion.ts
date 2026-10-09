export interface Pagina<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function armarPagina<T>(items: T[], total: number, page: number, limit: number): Pagina<T> {
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
