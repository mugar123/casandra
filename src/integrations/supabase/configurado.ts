function variable(
  nombreVite: string,
  nombreServidor: string,
): string | undefined {
  const desdeVite = import.meta.env[nombreVite];
  if (desdeVite) return desdeVite;
  if (typeof process === "undefined") return undefined;
  return process.env[nombreServidor];
}

// El cliente generado lanza si faltan las claves. En este entorno no hay
// credenciales, así que las pantallas comprueban esto antes de tocarlo.
export function supabaseConfigurado(): boolean {
  return Boolean(
    variable("VITE_SUPABASE_URL", "SUPABASE_URL") &&
    variable("VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY"),
  );
}
