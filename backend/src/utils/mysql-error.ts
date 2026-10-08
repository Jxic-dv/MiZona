/** Indica si un error es de MySQL con un código concreto (ej. ER_DUP_ENTRY). */
export function esErrorMysql(err: unknown, code: string): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === code;
}
