import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
import type { Session } from "@supabase/supabase-js";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function provisionUser(accessToken: string) {
  try {
    await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Silent — provisioning will retry on next API call
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Track the last token we provisioned so we only call /me once per token
  const provisionedToken = useRef<string | null>(null);

  const maybeProvision = (token: string) => {
    if (token && token !== provisionedToken.current) {
      provisionedToken.current = token;
      provisionUser(token);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        localStorage.setItem("sb-access-token", session.access_token);
        maybeProvision(session.access_token);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.access_token) {
        localStorage.setItem("sb-access-token", session.access_token);
        maybeProvision(session.access_token);
      } else {
        localStorage.removeItem("sb-access-token");
        provisionedToken.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    provisionedToken.current = null;
    localStorage.removeItem("sb-access-token");
  };

  return { session, loading, signOut };
}
