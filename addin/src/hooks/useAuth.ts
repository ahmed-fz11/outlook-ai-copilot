import { useEffect, useState } from "react";
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        localStorage.setItem("sb-access-token", session.access_token);
        provisionUser(session.access_token);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.access_token) {
        localStorage.setItem("sb-access-token", session.access_token);
        provisionUser(session.access_token);
      } else {
        localStorage.removeItem("sb-access-token");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem("sb-access-token");
  };

  return { session, loading, signOut };
}
