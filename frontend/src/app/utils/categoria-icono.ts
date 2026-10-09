export function categoriaIcono(nombre: string): string {
  const n = nombre.toLowerCase();
  return /agua|drenaj/.test(n)
    ? 'water'
    : /energ|luz/.test(n)
      ? 'bolt'
      : /vial|trán/.test(n)
        ? 'road'
        : 'works';
}
