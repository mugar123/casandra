import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useHaptic } from "@/hooks/useHaptic";
import { useSesion } from "@/hooks/useSesion";
import { Lock } from "lucide-react";
import { BarraNavegacion } from "@/components/BarraNavegacion";
import { VentanaComoFunciona } from "@/components/VentanaComoFunciona";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { TextoLatex } from "@/components/TextoLatex";
import { tieneLatex } from "@/lib/latex";
import { LoaderApp } from "@/components/LoaderApp";
import {
  probabilidad,
  useMercado,
  volumen,
  type Lado,
  type Pregunta,
} from "@/hooks/useMercado";

// ============================================================================
// SPINNER ESTILO NATIVO IOS (12 barritas)
// ============================================================================
function IosSpinner({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x="11"
          y="2.5"
          width="2.2"
          height="5.5"
          rx="1.1"
          fill="currentColor"
          opacity={0.3 + (0.7 * i) / 11}
          transform={`rotate(${i * 30} 12 12)`}
        />
      ))}
    </svg>
  );
}

const PREGUNTAS_EN_HOME = 4;

function ordenarParaHome(lista: Pregunta[], filtro: "recientes" | "hot") {
  return [...lista].sort((a, b) => {
    if (filtro === "hot") {
      const porGente = volumen(b) - volumen(a);
      if (porGente !== 0) return porGente;
    }
    return b.creadaEn - a.creadaEn;
  });
}
function aValorInputLocal(ts: number): string {
  const d = new Date(ts);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function CountdownExamen({
  fechaExamen,
  asignaturaId,
  onEditar,
}: {
  fechaExamen: number;
  asignaturaId: string;
  onEditar: (asignaturaId: string, fecha: Date | null) => Promise<boolean>;
}) {
  const [restanteMs, setRestanteMs] = useState(() => fechaExamen - Date.now());
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [valorInput, setValorInput] = useState(() =>
    aValorInputLocal(fechaExamen),
  );
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setRestanteMs(fechaExamen - Date.now());
    const id = setInterval(() => {
      setRestanteMs(fechaExamen - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [fechaExamen]);

  useEffect(() => {
    setValorInput(aValorInputLocal(fechaExamen));
  }, [fechaExamen]);

  if (restanteMs <= 0) return null;

  const totalSeg = Math.floor(restanteMs / 1000);
  const dias = Math.floor(totalSeg / 86400);
  const horas = Math.floor((totalSeg % 86400) / 3600);
  const min = Math.floor((totalSeg % 3600) / 60);

  const fechaFormateada = new Date(fechaExamen).toLocaleString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cerrarPopup = () => {
    setMostrarInfo(false);
    setEditando(false);
  };

  const guardarFecha = async () => {
    if (!valorInput) return;
    setGuardando(true);
    const ok = await onEditar(asignaturaId, new Date(valorInput));
    setGuardando(false);
    if (ok) {
      setEditando(false);
      setMostrarInfo(false);
    }
  };

  return (
    <article className="relative flex w-full flex-col items-center py-2">
      <p className="flex items-baseline justify-center gap-1.5 font-mono text-[13px] leading-none tabular-nums text-sutil">
        <span>
          <span className="text-ink/75">{dias}</span> días
        </span>
        <span aria-hidden="true" className="text-sutil/35">
          ·
        </span>
        <span>
          <span className="text-ink/75">{String(horas).padStart(2, "0")}</span>{" "}
          h
        </span>
        <span aria-hidden="true" className="text-sutil/35">
          ·
        </span>
        <span>
          <span className="text-ink/75">{String(min).padStart(2, "0")}</span>{" "}
          min
        </span>
      </p>

      <button
        onClick={() => setMostrarInfo(true)}
        className="mt-1.5 touch-manipulation text-center text-[11px] leading-none text-sutil/80 underline decoration-sutil/25 underline-offset-2 transition-colors hover:text-ink"
      >
        fecha informativa
      </button>

      {mostrarInfo &&
        createPortal(
          <div
            onClick={cerrarPopup}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
             
              className="w-full max-w-[320px] rounded-lg border border-borde bg-white p-5 text-left text-ink"
            >
              {!editando ? (
                <>
                  <p className="text-[17px] leading-relaxed text-sutil">
                    Fecha programada
                  </p>
                  <p className="mt-1 text-[17px] leading-relaxed">
                    {fechaFormateada}
                  </p>
                  <p className="mt-4 text-[17px] leading-relaxed text-sutil">
                    Esta fecha es informativa y puede estar equivocada.
                  </p>
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={cerrarPopup}
                      className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2.5 text-[17px] font-medium text-ink active:bg-black/5"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setEditando(true)}
                      className="flex-1 touch-manipulation rounded-lg bg-ink py-2.5 text-[17px] font-medium text-white active:opacity-70"
                    >
                      Corregir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[17px] leading-relaxed text-sutil">
                    Corregir fecha
                  </p>
                  <p className="mt-1 text-[17px] leading-relaxed text-sutil">
                    Cualquiera puede corregir esta fecha si está mal.
                  </p>
                  <input
                    type="datetime-local"
                    value={valorInput}
                    onChange={(e) => setValorInput(e.target.value)}
                    disabled={guardando}
                    style={{ fontSize: "17px" }}
                    className="mt-4 w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-left text-[17px] text-ink outline-none focus:border-ink/40 disabled:opacity-50 select-text"
                  />
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => setEditando(false)}
                      disabled={guardando}
                      className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2.5 text-[17px] font-medium text-ink active:bg-black/5 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarFecha}
                      disabled={guardando || !valorInput}
                      className="flex-1 touch-manipulation rounded-lg bg-ink py-2.5 text-[17px] font-medium text-white active:opacity-70 disabled:opacity-50"
                    >
                      {guardando ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </article>
  );
}

function EscalaPuntos({
  si,
  no,
  misSi,
  misNo,
}: {
  si: number;
  no: number;
  misSi: number;
  misNo: number;
}) {
  const safeSi = si || 0;
  const safeNo = no || 0;
  const safeMisSi = misSi || 0;
  const safeMisNo = misNo || 0;

  const total = safeSi + safeNo;

  if (total === 0) {
    return (
      <div className="mt-2.5 flex min-h-[16px] items-center">
        <p className="font-mono text-[11px] leading-none text-sutil">
          esperando apuestas
        </p>
      </div>
    );
  }

  const otrosNo = Math.max(0, safeNo - safeMisNo);
  const otrosSi = Math.max(0, safeSi - safeMisSi);

  return (
    <div className="mt-2.5 flex min-h-[16px] w-full items-center">
      <div className="flex w-full gap-4 items-start" aria-hidden="true">
        <div className="flex flex-1 flex-wrap content-start items-start justify-start gap-1">
          {Array.from({ length: otrosNo }).map((_, i) => (
            <span
              key={`no-o-${i}`}
              className="block h-2 w-2 shrink-0 rounded-full bg-rojo"
            />
          ))}
          {Array.from({ length: safeMisNo }).map((_, i) => (
            <span
              key={`no-m-${i}`}
              className="block h-2 w-2 shrink-0 rounded-full bg-moneda"
            />
          ))}
        </div>
        <div className="flex flex-1 flex-wrap flex-row-reverse content-start items-start gap-1">
          {Array.from({ length: otrosSi }).map((_, i) => (
            <span
              key={`si-o-${i}`}
              className="block h-2 w-2 shrink-0 rounded-full bg-verde"
            />
          ))}
          {Array.from({ length: safeMisSi }).map((_, i) => (
            <span
              key={`si-m-${i}`}
              className="block h-2 w-2 shrink-0 rounded-full bg-moneda"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FilaPregunta({
  pregunta,
  onApostar,
  onRetirar,
  bloqueado,
  sinTokens,
  ocultarBorde,
  contexto,
}: {
  pregunta: Pregunta;
  onApostar: (lado: Lado) => void;
  onRetirar: () => void;
  bloqueado?: boolean | undefined;
  sinTokens?: boolean;
  ocultarBorde?: boolean;
  contexto?: string | undefined;
}) {
  const prob = probabilidad(pregunta);
  const totalApuestas = (pregunta.poolSi || 0) + (pregunta.poolNo || 0);
  const tieneApuestas = totalApuestas > 0;
  const positivo = prob >= 50;
  const tengoApuesta = (pregunta.misSi || 0) + (pregunta.misNo || 0) > 0;

  const [cooldown, setCooldown] = useState(false);

  const juice = (el: HTMLElement | null) => {
    if (!el) return;
    el.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.82)", offset: 0.2 },
        { transform: "scale(1.14)", offset: 0.5 },
        { transform: "scale(0.97)", offset: 0.75 },
        { transform: "scale(1)" },
      ],
      { duration: 420, easing: "cubic-bezier(0.22, 0.9, 0.32, 1)" },
    );
  };

  const handleApostar = (lado: Lado, el: HTMLButtonElement | null) => {
    if (cooldown || bloqueado) return;
    setCooldown(true);
    juice(el);
    onApostar(lado);
    setTimeout(() => setCooldown(false), 400);
  };

  const visuallyBlocked = bloqueado && !cooldown;
  const btnBase =
    "flex flex-1 h-[42px] touch-manipulation items-center justify-center gap-2 rounded-lg border px-3 text-[14px] font-medium transition-all duration-150 ease-out";

  return (
    <article
      className={`py-6 w-full ${ocultarBorde ? "" : "border-b border-linea"}`}
    >
      {contexto && (
        <p className="mb-1 text-[12px] font-medium text-sutil">{contexto}</p>
      )}
      <div className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 flex-1 break-words text-[19px] font-medium leading-snug text-ink">
          <TextoLatex texto={pregunta.titulo} />
        </h2>
        <span
          className={`shrink-0 font-mono text-[30px] leading-none tabular-nums ${!tieneApuestas ? "text-sutil" : positivo ? "text-verde" : "text-rojo"}`}
        >
          {tieneApuestas ? `${prob}%` : "--%"}
        </span>
      </div>

      <EscalaPuntos
        si={pregunta.poolSi}
        no={pregunta.poolNo}
        misSi={pregunta.misSi}
        misNo={pregunta.misNo}
      />

      <div className="mt-3 flex gap-2">
        <button
          data-apuesta
          onClick={(e) => handleApostar("no", e.currentTarget)}
          disabled={visuallyBlocked}
         
          className={`${btnBase} ${visuallyBlocked ? "opacity-40" : "active:scale-[0.93]"} ${(pregunta.misNo || 0) > 0 ? "border-rojo bg-rojo text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`}
        >
          <span>NO</span>
          {(pregunta.misNo || 0) > 0 && (
            <span className="font-mono text-[16px] font-semibold tabular-nums">
              · {pregunta.misNo}
            </span>
          )}
        </button>
        <button
          data-apuesta
          onClick={(e) => handleApostar("si", e.currentTarget)}
          disabled={visuallyBlocked}
         
          className={`${btnBase} ${visuallyBlocked ? "opacity-40" : "active:scale-[0.93]"} ${(pregunta.misSi || 0) > 0 ? "border-verde bg-verde text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`}
        >
          <span>SÍ</span>
          {(pregunta.misSi || 0) > 0 && (
            <span className="font-mono text-[16px] font-semibold tabular-nums">
              · {pregunta.misSi}
            </span>
          )}
        </button>
      </div>

      {tengoApuesta && (
        <button
          onClick={onRetirar}
          disabled={visuallyBlocked || cooldown}
         
          className={`mt-2 flex h-[36px] w-full touch-manipulation items-center justify-center rounded-lg border border-borde bg-white text-[13px] font-medium text-sutil hover:border-ink/30 hover:text-ink transition-transform duration-150 active:bg-black/5 ${visuallyBlocked ? "opacity-40" : "active:scale-95"}`}
        >
          Retirar apuesta
        </button>
      )}
    </article>
  );
}

export function Asignaturas({
  asignaturas,
  asigId,
  setAsigActiva,
  preguntas,
  saldo,
}: {
  asignaturas: Array<{
    id: string;
    nombre: string;
    cerrada?: boolean;
    fechaExamen?: number | null;
  }>;
  asigId: string;
  setAsigActiva: (id: string) => void;
  preguntas: Pregunta[];
  saldo: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pb-4 pt-2">
      {asignaturas.map((a) => {
        const sinApostar = preguntas.filter(
          (p) =>
            p.asignaturaId === a.id &&
            p.resultado === null &&
            !p.archivada &&
            (p.misSi || 0) + (p.misNo || 0) === 0,
        ).length;

        return (
          <button
            key={a.id}
            onClick={() => setAsigActiva(a.id)}
           
            className={`relative flex touch-manipulation items-center gap-1.5 whitespace-nowrap border-b-2 pb-1 text-[13px] transition-colors ${
              a.id === asigId
                ? "border-ink font-semibold text-ink"
                : "border-transparent font-medium text-sutil"
            }`}
          >
            <span>{a.nombre}</span>
            {a.cerrada && <Lock className="h-3 w-3 opacity-60" />}
            {sinApostar > 0 && saldo > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-lienzo">
                {sinApostar}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PantallaNuevaPregunta({
  asignaturas,
  asigInicial,
  onCerrar,
  onCrear,
}: {
  asignaturas: Array<{ id: string; nombre: string; cerrada?: boolean }>;
  asigInicial: string;
  onCerrar: () => void;
  onCrear: (titulo: string, asignaturaId: string) => Promise<any>;
}) {
  const [titulo, setTitulo] = useState("");
  const [asigId, setAsigId] = useState(asigInicial);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    if (!titulo.trim()) {
      setError("Escribe un enunciado");
      return;
    }
    try {
      setCargando(true);
      setError(null);
      await onCrear(titulo, asigId);
      onCerrar();
    } catch (err) {
      console.error("Error al crear pregunta:", err);
      setError("No se pudo publicar. Revisa tu conexión o permisos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-lienzo"
      style={{ height: "100dvh" }}
    >
      <header
        className="flex shrink-0 items-center justify-between border-b border-linea px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
          paddingBottom: "0.75rem",
        }}
      >
        <button
          onClick={onCerrar}
          disabled={cargando}
         
          className="touch-manipulation px-1 py-1 text-[17px] text-ink disabled:opacity-40"
        >
          Cancelar
        </button>
        <span
         
          className="text-[15px] font-semibold text-ink"
        >
          Nueva pregunta
        </span>
        <button
          onClick={enviar}
          disabled={cargando || !titulo.trim()}
         
          className="touch-manipulation px-1 py-1 text-[17px] font-semibold text-ink disabled:opacity-30"
        >
          {cargando ? "..." : "Publicar"}
        </button>
      </header>
      <div
        className="flex-1 overflow-y-auto px-5 py-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <h1 className="text-[15px] font-semibold text-ink">
          Cuanto más específica mejor, frases largas.
        </h1>
        <textarea
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (error) setError(null);
          }}
          disabled={cargando}
          autoFocus
          rows={4}
          placeholder="¿Qué pregunta quieres proponer para todos?"
          style={{ fontSize: "16px" }}
          className="mt-3 w-full resize-none rounded-md border border-borde bg-white px-3 py-2.5 text-ink outline-none focus:border-ink/40 disabled:opacity-50 select-text"
        />
        <p className="mt-2 text-[13px] leading-relaxed text-sutil">
          Una fórmula va entre $ y $, como $x^2$.
        </p>
        {tieneLatex(titulo) && (
          <div className="mt-4 rounded-md border border-borde bg-white px-3 py-3">
            <p className="text-[12px] font-medium text-sutil">
              Así se verá
            </p>
            <p
             
              className="mt-2 text-[19px] font-medium leading-snug text-ink"
            >
              <TextoLatex texto={titulo} />
            </p>
          </div>
        )}
        <p
         
          className="mt-5 text-[13px] font-medium text-sutil"
        >
          Examen
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {asignaturas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAsigId(a.id)}
             
              disabled={cargando}
              className={`touch-manipulation whitespace-nowrap border-b-2 pb-1 text-[13px] transition-colors active:opacity-70 ${a.id === asigId ? "border-ink font-semibold text-ink" : "border-transparent font-medium text-sutil"}`}
            >
              {a.nombre}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-[13px] text-rojo">{error}</p>}
      </div>
    </div>
  );
}


export function MarketPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroHome, setFiltroHome] = useState<"recientes" | "hot">(
    "recientes",
  );

  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];

  const [rankingFijo, setRankingFijo] = useState<any[]>([]);

  // ESTADOS PULL TO REFRESH
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const pullStartY = useRef(0);
  const pullStartX = useRef(0);
  const isVerticalSwipe = useRef<boolean | null>(null);

  const REFRESH_THRESHOLD = 75;
  const SPINNER_OFFSET = 55;
  const SPRING_CONFIG = "0.4s cubic-bezier(0.3, 0.7, 0, 1)";

  // NOTA: el scroll real ahora ocurre DENTRO de mainContainerRef (no en el
  // documento/window). html y body están fijados (position: fixed) vía el
  // <style> de abajo, así que usamos mainContainerRef.current.scrollTop en
  // vez de window.scrollY, y .scrollTo() del propio div en vez de window.scrollTo.
  const handleMainTouchStart = (e: React.TouchEvent) => {
    const scrollTop = mainContainerRef.current?.scrollTop ?? 0;
    if (scrollTop <= 10 && !isRefreshing) {
      pullStartY.current = e.touches[0].clientY;
      pullStartX.current = e.touches[0].clientX;
      isVerticalSwipe.current = null;
      setIsPulling(true);
    }
  };

  const handleMainTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - pullStartY.current;
    const diffX = currentX - pullStartX.current;

    if (
      isVerticalSwipe.current === null &&
      (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)
    ) {
      isVerticalSwipe.current = Math.abs(diffY) > Math.abs(diffX);
    }

    if (isVerticalSwipe.current === false) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    const scrollTop = mainContainerRef.current?.scrollTop ?? 0;

    if (diffY > 0 && scrollTop <= 10) {
      const distance = diffY * (1 - Math.min(diffY / 600, 0.75));
      setPullDistance(distance);
    } else if (diffY < 0) {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handleMainTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= REFRESH_THRESHOLD && !isRefreshing) {
      haptic();
      setIsRefreshing(true);
      setPullDistance(SPINNER_OFFSET);

      try {
        if (typeof mercado.recargar === "function") {
          await mercado.recargar();
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } finally {
        mainContainerRef.current?.scrollTo({
          top: 0,
          behavior: "instant" as ScrollBehavior,
        });
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const rankingCalculado = mercado.leerRanking();
    if (rankingFijo.length === 0 && rankingCalculado.length > 0) {
      setRankingFijo(rankingCalculado);
    }
  }, [mercado.leerRanking, rankingFijo.length]);

  const asignaturasOrdenadas = [...asignaturas].sort((a, b) => {
    if (a.cerrada !== b.cerrada) return a.cerrada ? 1 : -1;
    if (a.fechaExamen == null && b.fechaExamen == null) return 0;
    if (a.fechaExamen == null) return 1;
    if (b.fechaExamen == null) return -1;
    return a.fechaExamen - b.fechaExamen;
  });

  useEffect(() => {
    const bloquearSwipeIOS = (e: TouchEvent) => {
      if (e.touches[0].clientX < 25) e.preventDefault();
    };
    document.addEventListener("touchstart", bloquearSwipeIOS, {
      passive: false,
    });
    return () => document.removeEventListener("touchstart", bloquearSwipeIOS);
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  }

  if (!mercado.perfilCargado) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  if (!mercado.perfil.claseId) {
    return (
      <PantallaSeleccionClase
        clases={mercado.leerClases()}
        onElegir={mercado.elegirClase}
      />
    );
  }

  const hayAsignaturasAbiertas = asignaturas.some((a) => !a.cerrada);
  const primeraAbierta = asignaturasOrdenadas.find((a) => !a.cerrada)?.id ?? "";
  const abiertas = preguntas.filter(
    (p) => p.resultado === null && !p.archivada,
  );
  const preguntasHome = ordenarParaHome(abiertas, filtroHome).slice(
    0,
    PREGUNTAS_EN_HOME,
  );
  const nombreAsignatura = (id: string) =>
    asignaturas.find((a) => a.id === id)?.nombre;
  const asignaturaCerrada = (id: string) =>
    asignaturas.find((a) => a.id === id)?.cerrada === true;

  const intentarApostar = (id: string, lado: Lado) => {
    haptic();
    if ((mercado.saldo || 0) < 1) {
      document.body.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-7px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(-4px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 280, easing: "ease-in-out" },
      );
      return;
    }
    mercado.apostar(id, lado);
  };

  const retirarPregunta = (id: string) => {
    haptic();
    mercado.retirar(id);
  };

  const pullProgress = Math.min(pullDistance / (REFRESH_THRESHOLD * 0.7), 1);

  const esModerador = !!mercado.perfil.mod || !!usuario.esAdmin;
  const puesto = rankingFijo.findIndex((r) => r.usuario === mercado.miNombre);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-lienzo">
      <div
        ref={mainContainerRef}
        onTouchStart={handleMainTouchStart}
        onTouchMove={handleMainTouchMove}
        onTouchEnd={handleMainTouchEnd}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-none select-none"
        style={{ WebkitOverflowScrolling: "touch" }}
        onClickCapture={(event) => {
          const target = event.target as Element;
          if (target.id === "haptic-checkbox" || target.id === "haptic-label")
            return;
          if (target.closest('input[type="text"], input:not([type]), textarea'))
            return;
          if (target.closest("a, input, select, button")) haptic();
        }}
      >
        <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }

        html, body {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
        }
      `}</style>

        <VentanaComoFunciona />

        <div className="relative w-full">
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 flex w-full items-center justify-center"
            style={{
              height: `${pullDistance}px`,
              transition: isPulling ? "none" : `height ${SPRING_CONFIG}`,
            }}
          >
            <div
              className="flex items-center justify-center text-sutil"
              style={{
                width: "42px",
                height: "42px",
                opacity: pullProgress,
                transition: isPulling ? "none" : `all ${SPRING_CONFIG}`,
              }}
            >
              <IosSpinner
                className="h-7 w-7"
                style={
                  !isRefreshing
                    ? { transform: `rotate(${pullDistance * 3}deg)` }
                    : { animation: "spin 1s steps(12, end) infinite" }
                }
              />
            </div>
          </div>

          <div
            style={{
              transform: `translateY(${pullDistance}px)`,
              transition: isPulling ? "none" : `transform ${SPRING_CONFIG}`,
            }}
          >
            <div
              className="mx-auto w-full max-w-[520px] px-5 pb-6 text-left"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)",
              }}
            >
              {!mercado.pausado && (
                <div className="flex items-center justify-between gap-3 pt-3">
                  <Link
                    to="/profile"
                    className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[17px] tabular-nums leading-none text-ink"
                  >
                    {Math.round(mercado.saldo || 0)}
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full bg-moneda"
                    />
                  </Link>
                  <Link
                    to="/ranking"
                    className="min-w-0 truncate text-right text-[15px] leading-none text-ink"
                  >
                    {puesto >= 0 ? `#${puesto + 1}` : "Fuera"}
                  </Link>
                </div>
              )}

              <div
                className="mt-4 flex justify-start gap-5"
                role="group"
                aria-label="Filtrar apuestas"
              >
                <button
                  type="button"
                  onClick={() => setFiltroHome("recientes")}
                  aria-pressed={filtroHome === "recientes"}
                  className={`touch-manipulation border-b-2 pb-1 text-[15px] font-medium ${
                    filtroHome === "recientes"
                      ? "border-ink text-ink"
                      : "border-transparent text-sutil"
                  }`}
                >
                  Recientes
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroHome("hot")}
                  aria-pressed={filtroHome === "hot"}
                  className={`touch-manipulation border-b-2 pb-1 text-[15px] font-medium ${
                    filtroHome === "hot"
                      ? "border-ink text-ink"
                      : "border-transparent text-sutil"
                  }`}
                >
                  Hot
                </button>
              </div>

              {preguntasHome.length === 0 ? (
                <p className="mt-6 text-left text-[15px] text-sutil">
                  No hay preguntas abiertas.
                </p>
              ) : (
                preguntasHome.map((p, index) => (
                  <FilaPregunta
                    key={p.id}
                    pregunta={p}
                    contexto={nombreAsignatura(p.asignaturaId)}
                    bloqueado={
                      mercado.pausado || asignaturaCerrada(p.asignaturaId)
                    }
                    sinTokens={(mercado.saldo || 0) < 1}
                    ocultarBorde={index === preguntasHome.length - 1}
                    onApostar={(lado) => intentarApostar(p.id, lado)}
                    onRetirar={() => retirarPregunta(p.id)}
                  />
                ))
              )}

              <Link
                to="/apuestas"
                className="mt-2 inline-block text-[15px] text-ink underline decoration-linea underline-offset-4"
              >
                Ver todas
              </Link>

              {hayAsignaturasAbiertas && (
                <button
                  type="button"
                  onClick={() => setModalAbierto(true)}
                  className="mb-6 mt-4 w-full touch-manipulation rounded-lg border border-borde bg-white py-3 text-[15px] font-medium text-ink"
                >
                  Proponer pregunta
                </button>
              )}
            </div>
          </div>
        </div>

        {modalAbierto && (
          <PantallaNuevaPregunta
            asignaturas={asignaturas.filter((a) => !a.cerrada)}
            asigInicial={primeraAbierta}
            onCerrar={() => setModalAbierto(false)}
            onCrear={async (t, id) => {
              await mercado.crearPregunta(t, id);

              if (typeof mercado.recargar === "function") {
                await mercado.recargar();
              }
            }}
          />
        )}

        <input
          type="checkbox"
          id="haptic-checkbox"
          ref={(el) => {
            if (el) el.setAttribute("switch", "");
          }}
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            opacity: "0",
            pointerEvents: "none",
            width: "1px",
            height: "1px",
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
        <label
          htmlFor="haptic-checkbox"
          id="haptic-label"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            opacity: "0",
            pointerEvents: "none",
            width: "1px",
            height: "1px",
          }}
          aria-hidden="true"
        ></label>
      </div>
      <BarraNavegacion
        activa="inicio"
        esAdmin={!!usuario.esAdmin}
        esModerador={esModerador}
      />
    </div>
  );
}
