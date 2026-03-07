import { useEffect, useState } from "react";
import { getCurrentEmail } from "../services/outlook";
import type { EmailContext } from "../types";

export function useEmailContext() {
  const [email, setEmail] = useState<EmailContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentEmail();
      setEmail(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to read email");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmail();
  }, []);

  return { email, loading, error, refetch: fetchEmail };
}
