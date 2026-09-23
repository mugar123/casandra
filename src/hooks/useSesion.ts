import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseConfigurado } from "@/integrations/supabase/configurado";
import type { Usuario } from "./useMercado";

const ADMIN_HANDLE = "jose.luefer";

function generarHashUsuario(id: string): string {
  // Genera un identificador hash corto y único basado en el ID del usuario
  return `user_${id.replace(/-/g, "").slice(0, 8)}`;
}

function aUsuario(id: string, email: string | null | undefined): Usuario {
  const correo = email ?? "";
  const handle = correo.split("@")[0]?.toLowerCase() ?? "";
  return {
    id: id,
    nombre: generarHashUsuario(id),
    esAdmin: handle === ADMIN_HANDLE,
  };
}

export function useSesion() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabaseConfigurado()) {
      setCargando(false);
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(
        session?.user ? aUsuario(session.user.id, session.user.email) : null,
      );
      setCargando(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setUsuario(
        data.session?.user
          ? aUsuario(data.session.user.id, data.session.user.email)
          : null,
      );
      setCargando(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const entrarConGoogle = async () => {
    if (!supabaseConfigurado()) {
      return "El acceso con Google necesita las claves de Supabase de este entorno.";
    }
    const retorno = new URL(window.location.href);
    retorno.hash = "";
    const destino = `${retorno.origin}${retorno.pathname}${retorno.search}`;
    // Si la dirección no está permitida, Supabase ignora el retorno y manda
    // el navegador a la Site URL del proyecto, que es localhost.
    if (!origenPermitido(retorno.hostname)) {
      return "Desde esta dirección Google te devolvería a localhost. El acceso se queda en esta página.";
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: destino,
      },
    });
    if (error) return error.message;
  };

  const salir = async () => {
    if (!supabaseConfigurado()) return;
    await supabase.auth.signOut();
  };

  return { usuario, cargando, entrarConGoogle, salir };
}

function origenPermitido(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}
