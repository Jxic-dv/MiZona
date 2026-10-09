export function fecha(valor: string | null): string {
  return valor
    ? new Intl.DateTimeFormat('es-GT', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Guatemala',
      }).format(new Date(valor))
    : 'Por confirmar';
}
export function fechaInput(valor: string): string {
  // Los formularios usan la hora de Guatemala independientemente del equipo del usuario.
  return new Date(new Date(valor).getTime() - 6 * 3600000).toISOString().slice(0, 16);
}
