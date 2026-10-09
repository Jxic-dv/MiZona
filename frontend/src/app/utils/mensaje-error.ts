import { HttpErrorResponse } from '@angular/common/http';
export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    const detalles = error.error?.detalles as { mensaje: string }[] | undefined;
    return (
      detalles?.map((d) => d.mensaje).join('. ') ||
      error.error?.error ||
      'No se pudo completar la solicitud. Inténtalo de nuevo.'
    );
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
