import { useState } from "react";

export function FotoPerfil({
  foto,
  inicial,
  className = "h-8 w-8 text-[13px]",
  marcada = false,
}: {
  foto: string | null;
  inicial: string;
  className?: string;
  marcada?: boolean;
}) {
  const [rota, setRota] = useState(false);
  const anillo = marcada ? "ring-2 ring-ink ring-offset-2 ring-offset-lienzo" : "";

  if (foto && !rota) {
    return (
      <img
        src={foto}
        alt=""
        onError={() => setRota(true)}
        className={`${className} rounded-full object-cover ${anillo}`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${className} flex items-center justify-center rounded-full bg-ink font-mono font-medium text-white ${anillo}`}
    >
      {inicial}
    </span>
  );
}
