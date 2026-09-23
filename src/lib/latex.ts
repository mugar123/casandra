export type ParteLatex =
  { tipo: "texto"; valor: string } | { tipo: "latex"; valor: string };

export function partesDeLatex(texto: string): ParteLatex[] {
  const partes: ParteLatex[] = [];
  const expresion = /\$([^$]+)\$/g;
  let cursor = 0;
  for (const coincidencia of texto.matchAll(expresion)) {
    const inicio = coincidencia.index ?? 0;
    if (inicio > cursor) {
      partes.push({ tipo: "texto", valor: texto.slice(cursor, inicio) });
    }
    partes.push({ tipo: "latex", valor: coincidencia[1].trim() });
    cursor = inicio + coincidencia[0].length;
  }
  if (cursor < texto.length) {
    partes.push({ tipo: "texto", valor: texto.slice(cursor) });
  }
  return partes;
}

export function tieneLatex(texto: string): boolean {
  return partesDeLatex(texto).some(
    (parte) => parte.tipo === "latex" && parte.valor.length > 0,
  );
}
