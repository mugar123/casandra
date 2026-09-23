const CLAVES_ERROR = ["error", "error_description", "error_code"] as const;
const CLAVES_QUE_NO_SE_REENVIAN = [
  "error",
  "error_description",
  "error_code",
  "code",
  "sb_flow_id",
] as const;

// Se rellena al cargar el módulo, antes de que el cliente de Supabase lea
// la dirección. Si el regreso de Google trae un error viejo junto al código,
// Supabase aborta el canje y la pantalla de acceso no llega a abrirse.
export let avisoAuthInicial: string | null = null;
export let retornoConCredencial = false;

export function anotarAvisoAuth(mensaje: string) {
  if (!avisoAuthInicial) avisoAuthInicial = mensaje;
}

function parametrosHash(url: URL): URLSearchParams {
  const texto = url.hash.startsWith("#") ? url.hash.slice(1) : "";
  return new URLSearchParams(texto);
}

function hayCodigo(url: URL, hash: URLSearchParams): boolean {
  return (
    url.searchParams.has("code") ||
    url.searchParams.has("access_token") ||
    hash.has("code") ||
    hash.has("access_token")
  );
}

function hayError(url: URL, hash: URLSearchParams): boolean {
  return CLAVES_ERROR.some(
    (clave) => url.searchParams.has(clave) || hash.has(clave),
  );
}

function quitarClaves(
  url: URL,
  hash: URLSearchParams,
  claves: readonly string[],
) {
  for (const clave of claves) {
    url.searchParams.delete(clave);
    hash.delete(clave);
  }
  const texto = hash.toString();
  url.hash = texto ? `#${texto}` : "";
}

function mensajeDeError(codigo: string | null): string {
  if (codigo === "access_denied") {
    return "El acceso con Google no se ha completado. Vuelve a entrar con tu cuenta @usal.es.";
  }
  return "No se ha podido abrir la sesión. Vuelve a entrar con tu cuenta @usal.es.";
}

export function prepararRetornoDeAuth(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const hash = parametrosHash(url);
  if (!hayError(url, hash)) return null;

  const codigoError = url.searchParams.get("error") || hash.get("error");
  const conCodigo = hayCodigo(url, hash);
  quitarClaves(url, hash, CLAVES_ERROR);
  window.history.replaceState(window.history.state, "", url.toString());
  if (conCodigo) return null;
  return mensajeDeError(codigoError);
}

export function destinoDeRetorno(): string {
  const url = new URL(window.location.href);
  url.hash = "";
  for (const clave of CLAVES_QUE_NO_SE_REENVIAN) {
    url.searchParams.delete(clave);
  }
  const consulta = url.searchParams.toString();
  return `${url.origin}${url.pathname}${consulta ? `?${consulta}` : ""}`;
}

if (typeof window !== "undefined") {
  const actual = new URL(window.location.href);
  const hashActual = parametrosHash(actual);
  retornoConCredencial =
    actual.searchParams.has("code") ||
    hashActual.has("code") ||
    hashActual.has("access_token");
  avisoAuthInicial = prepararRetornoDeAuth();
}
