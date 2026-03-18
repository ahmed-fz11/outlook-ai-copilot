import { useEffect, useState } from "react";
import { lookupCustomer } from "../services/api";
import type { CustomerInfo } from "../services/api";

export function useCustomer(senderEmail: string | undefined) {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!senderEmail) {
      setCustomer(null);
      return;
    }
    setLoading(true);
    lookupCustomer(senderEmail)
      .then(setCustomer)
      .finally(() => setLoading(false));
  }, [senderEmail]);

  return { customer, loading };
}
