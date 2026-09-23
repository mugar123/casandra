import katex from "katex";
import "katex/dist/katex.min.css";
import { partesDeLatex, tieneLatex } from "@/lib/latex";

function formula(valor: string): string {
  return katex.renderToString(valor, {
    throwOnError: false,
    displayMode: false,
    strict: "ignore",
  });
}

export function TextoLatex({ texto }: { texto: string }) {
  const partes = partesDeLatex(texto);
  if (!tieneLatex(texto)) return <>{texto}</>;

  return (
    <>
      {partes.map((parte, indice) =>
        parte.tipo === "texto" ? (
          <span key={indice}>{parte.valor}</span>
        ) : (
          <span
            key={indice}
            className="mx-0.5 inline-block max-w-full overflow-x-auto align-middle"
            dangerouslySetInnerHTML={{ __html: formula(parte.valor) }}
          />
        ),
      )}
    </>
  );
}
