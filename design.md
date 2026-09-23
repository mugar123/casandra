# Diseño de Casandra

Documento de referencia del **diseño original** de la app. Su objetivo es que, según vayamos
haciendo cambios, no se pierda la identidad visual ni los patrones de interacción actuales.

Trátalo como la "fuente de la verdad" del look & feel. Si un cambio se desvía de lo aquí
descrito, debe ser una decisión consciente y, si se consolida, actualizar este documento.

> Fuentes: `src/styles.css` (tokens), `src/screens/*`, `src/components/*`, `src/hooks/useHaptic.ts`.
> Capturas de referencia: `src/images/preview.png`, `src/images/question.png`.

---

## 1. Filosofía de diseño

Casandra imita la estética de una **app nativa de iOS**, minimalista y editorial:

- **Sobria y silenciosa**: fondo crema, mucho aire, sin sombras fuertes ni bordes gruesos.
- **Tipografía como protagonista**: los números (saldo, probabilidad, cuenta atrás) se muestran
  grandes, en monospace y con `tabular-nums`. El contenido manda; el "chrome" desaparece.
- **Mobile-first / PWA**: diseñada para usarse en el móvil, instalada en pantalla completa
  (`standalone`). Respeta `safe-area-inset`, bloquea el rebote elástico de iOS y ofrece
  pull-to-refresh y feedback háptico.
- **Feedback físico**: micro-animaciones "con jugo" (squash & stretch) al apostar, saldo que
  rueda como un contador, y vibración en cada interacción.
- **Semáforo semántico**: verde = SÍ, rojo = NO, amarillo = tokens/moneda. Coherente en toda la app.

---

## 2. Tokens de diseño

Definidos en `src/styles.css`. **Regla dura del proyecto: todos los colores en formato `oklch`.**
El sistema usa Tailwind v4 con `@theme inline`, que expone cada variable como utilidad
(`--color-lienzo` → `bg-lienzo`, `text-lienzo`, etc.).

### 2.1 Paleta semántica propia (la que define la identidad)

| Token (utilidad)     | Variable   | Valor `oklch`             | Uso |
| -------------------- | ---------- | ------------------------- | --- |
| `lienzo`             | `--lienzo` | `oklch(0.972 0.003 90)`   | Fondo global (crema/hueso). **El fondo NUNCA es blanco puro.** |
| `ink`                | `--ink`    | `oklch(0.19 0.005 90)`    | Texto principal y superficies oscuras (botones primarios, chip activo). Casi negro cálido. |
| `sutil`              | `--sutil`  | `oklch(0.58 0.005 90)`    | Texto secundario, metadatos, placeholders. |
| `linea`              | `--linea`  | `oklch(0.9 0.004 90)`     | Divisores/separadores finos (`border-b`). |
| `borde`              | `--borde`  | `oklch(0.86 0.004 90)`    | Borde de botones, inputs y tarjetas. |
| `verde`              | `--verde`  | `oklch(0.55 0.15 150)`    | **SÍ**, acierto, "entró", estado activado. |
| `rojo`               | `--rojo`   | `oklch(0.56 0.19 22)`     | **NO**, fallo, "no entró", cerrar sesión, errores. |
| `moneda`             | `--moneda` | `oklch(0.83 0.17 88)`     | Tokens, moneda amarilla, marca de "mi apuesta". |

Las superficies de tarjeta/input usan **blanco puro** (`bg-white`) sobre el lienzo crema para
destacar; los estados "hundidos" usan `bg-black/5`.

### 2.2 Tipografía

```css
--font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
--font-mono: "Helvetica Neue", Helvetica, Arial, sans-serif; /* mono = misma familia */
```

- **Fuente base**: Helvetica Neue / system sans. No hay fuentes web personalizadas.
- **`fuenteApple`**: la mayoría de pantallas aplican inline
  `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
  Es el patrón dominante para lograr el aspecto nativo; consérvalo en pantallas nuevas.
- **`font-mono` + `tabular-nums`**: obligatorio para cifras (saldo, `%`, cuenta atrás, ranking,
  contadores de tokens). Da alineación de cifras tipo "terminal".
- **Etiquetas mono en versalitas**: patrón repetido
  `font-mono text-[11px] uppercase tracking-widest` (constante `mono`) para etiquetas como
  `ADMN`, `MOD`, "RESUELTA · ENTRÓ", "esperando apuestas".

**Escala tipográfica** (tamaños fijos en `px` vía `text-[Npx]`, no la escala por defecto de Tailwind):

| Tamaño | Uso típico |
| ------ | ---------- |
| `64px` | Saldo animado (`SaldoAnimado`). |
| `39px` | Número de posición #1–#3 en el ranking. |
| `32px` | Título de pantallas de onboarding (login, elegir clase). |
| `30px` | Probabilidad `%` en cada pregunta. |
| `28px` | Título de página (Perfil, Ranking, Recompensas). |
| `26px` | Dígitos de la cuenta atrás del examen. |
| `19px` | Enunciado de la pregunta en el mercado. |
| `17px` | Cuerpo estándar iOS, filas de ranking, botones de modales. |
| `15–16px` | Texto de cuerpo, headers de barra superior, botones. |
| `13–14px` | Metadatos, botones secundarios, notas. |
| `11–12px` | Etiquetas mono en versalitas, badges, disclaimers. |

Pesos habituales: `font-bold` (títulos), `font-semibold`/`font-medium` (botones y énfasis),
`font-normal` (cuerpo). `tracking-tight` en títulos; `tracking-widest` en etiquetas mono.

### 2.3 Radios

`--radius: 0.625rem` (10px) como base. Escala derivada: `sm` (radius−4) … `4xl` (radius+16).

Convenciones reales de uso:

- `rounded-full` → chips de asignatura, moneda, badges, píldoras/botón "Proponer pregunta",
  toggle switch, avatar del contador de tokens.
- `rounded-xl` → botones grandes (login, elegir clase, logout), tarjeta de sección en Perfil,
  fila resaltada "yo" en el ranking.
- `rounded-lg` → botones SÍ/NO, inputs, popovers, tarjetas del admin.
- `rounded-md` → textarea de nueva pregunta.

### 2.4 Tema oscuro y tokens shadcn

`styles.css` incluye la batería completa de variables de shadcn/ui
(`--background`, `--primary`, `--card`, `--chart-*`, `--sidebar-*`, …) y un bloque `.dark`.
**Sin embargo, la app funciona siempre en claro**: `<html>` no aplica la clase `.dark` y el
`body` fuerza `background: var(--lienzo); color: var(--ink)`. Los tokens shadcn existen para los
componentes de `src/components/ui/**` pero **la identidad de Casandra se construye con la paleta
propia** (`lienzo/ink/sutil/verde/rojo/moneda`), no con `primary/secondary`.

---

## 3. Layout y estructura

### 3.1 Contenedor y anchura

- **Ancho máximo de contenido: `max-w-[520px]`, centrado (`mx-auto`)** en todas las páginas.
- Las pantallas de onboarding (login, elegir clase) usan una columna más estrecha:
  `max-w-[340px]`, alineada a la izquierda (`text-left`).
- Padding horizontal estándar: `px-5`.

### 3.2 Barra superior (header)

Patrón consistente en Perfil, Ranking, Resueltas, Admin, Mod:

```
header: fixed inset-x-0 top-0 z-20 bg-lienzo/95 backdrop-blur   (+ border-b border-linea en algunas)
        paddingTop: env(safe-area-inset-top)
  contenido: mx-auto flex h-14 max-w-[520px] items-center px-5
```

- Altura de barra: `h-14`.
- Enlace de retorno a la izquierda: `← Volver` / `← Volver al mercado`
  (`text-[15px] font-medium/semibold tracking-tight text-ink`, hover `opacity-70`, active `opacity-40`).
- El **header del mercado** (`MarketPage`) no es fijo, va en flujo y contiene el título
  `Probabilidad fiable?` (izq.) y los accesos: `ADMN`, `MOD` (solo con permisos, en estilo mono),
  icono Resueltas (`ClipboardList`) e icono Perfil (`Settings`), ambos de lucide a 20px.
- El contenido bajo un header fijo se separa con
  `pt-[calc(4.5rem+env(safe-area-inset-top))]` (o `5rem`/`4rem` según pantalla).

### 3.3 Safe areas y PWA

- Respetar siempre `env(safe-area-inset-top)` (arriba) y `env(safe-area-inset-bottom)` (abajo,
  p. ej. `paddingBottom: calc(env(safe-area-inset-bottom) + 1.25rem)`).
- El mercado **fija `html, body` con `position: fixed; overflow: hidden; overscroll-behavior: none`**
  y hace el scroll dentro de su propio contenedor. Esto elimina el "liquid glass"/rebote de iOS en
  modo standalone. No romper esto al tocar el layout del mercado.
- **Scrollbars ocultas** globalmente en el mercado (`scrollbar-width: none`, `::-webkit-scrollbar { display:none }`).
- Se bloquea el swipe-to-go-back de iOS: `touchstart` con `preventDefault()` si el toque empieza
  en los primeros 25px del borde izquierdo (repetido en Market, Profile, Ranking, Resueltas).

---

## 4. Componentes y patrones clave

### 4.1 Fila de pregunta (mercado) — `FilaPregunta`

El componente central del mercado. Nota: existe una versión propia dentro de `MarketPage.tsx`
(la que se usa en producción, con `EscalaPuntos` y animación "juice") y otra más simple en
`src/components/FilaPregunta.tsx` (con `MiniGrafico` de barra). El diseño de referencia es el de
`MarketPage.tsx`:

- Contenedor `article` con `py-6` y `border-b border-linea` (sin borde en la última).
- Cabecera: enunciado `text-[19px] font-medium leading-snug text-ink` a la izquierda; a la
  derecha la probabilidad `font-mono text-[30px] tabular-nums`, coloreada
  **verde si ≥50%, rojo si <50%, `sutil` si aún no hay apuestas** (muestra `--%`).
- **`EscalaPuntos`**: en lugar de una barra, dibuja **puntos de 8px** (`h-2 w-2 rounded-full`),
  NO a la izquierda y SÍ a la derecha (fila invertida). Los puntos de otros usuarios van en
  `verde`/`rojo`; **mis apuestas se pintan en `moneda` (amarillo)**. Sin apuestas → texto mono
  "esperando apuestas".
- Botones **NO** y **SÍ**: `flex-1 h-[42px] rounded-lg border text-[14px] font-medium`.
  - Sin mi apuesta: `border-borde bg-white text-ink` (hover `border-ink/30`).
  - Con mi apuesta: relleno pleno `bg-rojo`/`bg-verde` + `text-white`, y muestra `· N` (mis tokens).
  - Sin tokens: `border-linea bg-black/5 text-sutil` (aspecto deshabilitado).
- Botón **Retirar apuesta**: secundario, `h-[36px] w-full rounded-lg border border-borde bg-white text-sutil`.
- Estado cerrado/resuelto: etiqueta mono `Resuelta · entró/no entró`.

### 4.2 Chips de asignatura — `Asignaturas`

Píldoras horizontales centradas (`flex flex-wrap justify-center gap-2`):
`rounded-full border px-3.5 py-1.5 text-[13px] font-medium`.

- Activa: `border-ink bg-ink text-white`. Inactiva: `border-borde bg-white text-ink`.
- Candado (`Lock` de lucide, 12px, `opacity-60`) si la asignatura está cerrada.
- **Badge de pendientes**: círculo `bg-ink text-white` posicionado en la esquina superior derecha
  (`-right-1.5 -top-1.5`, `ring-2 ring-lienzo`) con el nº de preguntas sin apostar.
- Cambiar de asignatura hace un scroll horizontal animado (snap) muy rápido entre "slides".

### 4.3 Saldo animado — `SaldoAnimado`

Cifra gigante `font-mono text-[64px] tabular-nums text-ink` que **rueda** entre valores con
`requestAnimationFrame` (easing cúbico, 800 ms), con máscara de degradado vertical durante la
animación (efecto contador tipo slot). Junto a ella, la **moneda** amarilla (`Moneda`,
`rounded-full bg-moneda`) de ~47px. Este bloque solo se muestra si el usuario no está pausado.

### 4.4 Cuenta atrás del examen — `CountdownExamen`

`DD días : HH horas : MM min` con dígitos `font-mono text-[26px] tabular-nums text-ink` y
unidades en `text-[18px] text-sutil`; `:` separadores. Debajo, enlace sutil subrayado
"fecha informativa, puedes corregirla si está mal" que abre un **popover** (vía `createPortal`
sobre `bg-black/40 backdrop-blur-sm`) para ver/editar la fecha. Cualquiera puede corregirla.

### 4.5 Onboarding — `PantallaLogin` y `PantallaSeleccionClase`

- Columna `max-w-[340px]`, contenido alineado a la izquierda, `h-100dvh`, scroll bloqueado.
- Login: **loader propio de dos bolas amarillas** (`.loader-casandra`, animación CSS de giro lento
  6s + rebote), título `text-[32px] font-bold`, párrafos `text-[18px] text-ink/80`, y botón
  primario `rounded-xl bg-ink py-4 text-white` "Entra con tu cuenta @usal.es". Nota de privacidad
  en `text-[12px] text-sutil` enlazando a `/privacidad`.
- Selección de clase: mismo esqueleto; botones-lista `rounded-xl border border-borde bg-white py-4`.

### 4.6 Loaders

- **`LoaderApp`** (loader global entre estados): dos puntos (rojo y verde, 15px) que giran uno
  alrededor del otro con `@keyframes`. Se centra en `min-h-[50vh]`/`min-h-screen bg-lienzo`.
- **`IosSpinner`** (pull-to-refresh): SVG de 12 barritas con opacidad creciente, girando en
  `steps(12, end)` como el spinner nativo de iOS.
- **`.loader-casandra`** (login): dos bolas amarillas rebotando.

### 4.7 Formularios y controles

- **Inputs / textarea / select**: `rounded-lg/md border border-borde`, fondo `bg-black/5` en reposo
  y `bg-white` al enfocar, `focus:border-ink/30` (o `ink/40`), `text-ink`, placeholder `text-sutil`.
  `font-size: 16px` mínimo en campos para evitar el zoom automático de iOS.
- **Toggle/switch** (Perfil, "sin nombre de usuario"): pista `h-[31px] w-[51px] rounded-full`,
  `bg-verde` activo / `bg-black/10` inactivo, pomo blanco `h-[27px] w-[27px]` con `translate-x-[20px]`.
  Réplica fiel del switch de iOS.
- **Modal a pantalla completa** (`PantallaNuevaPregunta`): `fixed inset-0 z-40 bg-lienzo`, con
  header propio (`Cancelar` / título / `Publicar`) al estilo de hoja modal de iOS.

### 4.8 Botones (resumen de estilos)

- **Primario oscuro**: `bg-ink text-white`, `rounded-xl` (grande) o `rounded-full` (píldora
  "Proponer pregunta", con `px-6 py-3`), `shadow-sm`, `active:scale-95`.
- **Secundario contorno**: `border border-borde bg-white text-ink`, hover `border-ink/30`.
- **Destructivo suave**: `bg-rojo/10 text-rojo`, active `bg-rojo/20` (cerrar sesión).
- **Terciario/enlace**: texto `text-sutil` con subrayado `decoration-sutil/40 underline-offset-4`,
  hover a `text-ink`.

### 4.9 Iconografía

- **lucide-react** para iconos de sistema: `Settings`, `ClipboardList`, `Lock` (a 20px, `strokeWidth 2`).
- **SVGs inline a medida** para el resto, con trazo redondeado (`strokeLinecap/Linejoin="round"`,
  `strokeWidth` 2–3): icono de compartir estilo iOS, triángulo de toggle tipo Notion, `+` de
  proponer, lápiz de editar, flecha de select, reloj del ranking, tic/equis de resueltas.
- Evitar emojis del sistema: se usan SVGs propios (ver `TicIcon`/`EquisIcon`).

---

## 5. Pantallas (inventario)

| Ruta | Componente | Resumen visual |
| ---- | ---------- | -------------- |
| `/` | `MarketPage` | Home. Saldo animado + moneda, frase de ranking dinámica, chips de asignaturas, slider horizontal de preguntas por asignatura, cuenta atrás, "Proponer pregunta", compartir y toggle explicativo. Pull-to-refresh. |
| `/ranking` | `PaginaRanking` | "Gente que más acierta": lista con posición grande (top-3 en degradado ámbar), nombre, última actividad (reloj con ping) y tokens+moneda. Fila propia resaltada `bg-black/[0.04]`. Sección "Recompensas" (ads opcionales tras flag `MOSTRAR_ADS`). |
| `/profile` | `ProfilePage` | "Perfil": tarjeta blanca con nombre editable (input con lápiz), switch anónimo, selector de clase; nota del nombre visible; botón rojo suave de cerrar sesión; crédito "Hecho por José en 2026". |
| `/resueltas` | `ResueltasScreen` | "Comprueba": preguntas resueltas del usuario agrupadas por asignatura; cada fila con chip tic/equis (`bg-ink`), resultado ENTRÓ/NO ENTRÓ (verde/rojo) y `%` gigante fantasma en `text-black/15`. |
| `/admin` | `AdminPage` | Panel de administración: filtros en píldoras, tarjetas `rounded-xl border border-borde bg-white`, muchas etiquetas mono. Solo admin. |
| `/mod` | `ModPage` | Panel de moderación (subconjunto de admin) para moderadores de clase. |
| `/privacidad` | `PaginaPrivacidad` | Página estática de política de privacidad; header con `← Volver`, títulos en negrita, cuerpo en `text-ink`. No requiere datos. |
| 404 / error | en `__root.tsx` | Pantallas centradas con título, texto `sutil` y botones "Go home"/"Try again" en `bg-primary`. |

Estados comunes en cada pantalla con datos: `cargando` → `LoaderApp`; sin sesión → `PantallaLogin`;
perfil sin cargar → `LoaderApp`; sin clase elegida → `PantallaSeleccionClase`.

---

## 6. Movimiento e interacción

El movimiento es parte esencial de la identidad. Al añadir features, mantener este vocabulario:

- **Háptica en todo** (`useHaptic`): cada tap sobre `a/input/select/button` vibra (Vibration API en
  Android; truco de `<label switch>` oculto para iOS). Hay un checkbox+label ocultos fijos en el DOM
  del mercado que no deben eliminarse.
- **"Juice" al apostar**: el botón hace squash & stretch (`scale` 1 → 0.82 → 1.14 → 1) en 420 ms con
  `cubic-bezier(0.22, 0.9, 0.32, 1)`, más `active:scale-[0.93]`. Cooldown de 400 ms.
- **Saldo que rueda**: contador animado con máscara de degradado (ver 4.3).
- **Sin saldo**: al intentar apostar con 0 tokens, `document.body` hace un shake horizontal (280 ms).
- **Pull-to-refresh nativo**: umbral 75px, spinner iOS que rota según el arrastre y luego gira solo;
  muelle `0.4s cubic-bezier(0.3, 0.7, 0, 1)`. Solo dispara si el scroll está arriba y el gesto es vertical.
- **Transiciones estándar**: `transition-colors`/`transition-transform` con `active:scale-*` y
  `active:opacity-*`. Duraciones cortas (150–200 ms). Nada de animaciones largas o llamativas.

---

## 7. Reglas para no perder el diseño

Checklist al implementar cambios o nuevas pantallas:

1. **Colores solo con la paleta semántica propia** (`lienzo/ink/sutil/linea/borde/verde/rojo/moneda`)
   y **siempre en `oklch`** si añades tokens nuevos (registrar en `:root`, `.dark` y `@theme inline`).
   Fondo crema (`bg-lienzo`), nunca blanco puro para el lienzo; superficies en `bg-white`.
2. **Mantén el semáforo**: verde = SÍ/acierto, rojo = NO/fallo, amarillo (`moneda`) = tokens y
   "mi apuesta". No reasignar estos significados.
3. **Cifras en `font-mono` + `tabular-nums`**. Etiquetas de estado en mono, `uppercase`, `tracking-widest`.
4. **Aplica `fuenteApple`** (inline) en pantallas nuevas para el aspecto nativo.
5. **Contenedor `max-w-[520px] mx-auto px-5`**; onboarding a `max-w-[340px]` alineado a la izquierda.
6. **Header fijo** con el patrón `h-14 bg-lienzo/95 backdrop-blur` + `← Volver`, respetando
   `safe-area-inset-top` y el padding superior calculado.
7. **Respeta safe-areas y el bloqueo de scroll/rebote de iOS**; no reactivar el scroll del documento
   en el mercado ni quitar el bloqueo del swipe-back.
8. **Radios coherentes**: `rounded-full` (chips/píldoras/badges), `rounded-xl` (botones grandes y
   tarjetas), `rounded-lg` (botones SÍ/NO, inputs), `rounded-md` (textarea).
9. **Iconos**: lucide para sistema; SVG inline con trazo redondeado para el resto. **Sin emojis.**
10. **Conserva el movimiento**: háptica en taps, "juice" al apostar, `active:scale`/`opacity`,
    y el loader adecuado según el estado (`LoaderApp`, `IosSpinner`, `.loader-casandra`).
11. **Estados de datos**: cubre siempre cargando / sin sesión / sin perfil / sin clase con los
    componentes existentes.
12. **Tema**: la app es solo claro. No introducir un cambio a modo oscuro sin decisión explícita.

---

_Última actualización: refleja el estado del diseño en el momento de crear este documento.
Si cambias algo estructural del look & feel, actualiza la sección correspondiente aquí mismo._
