import { useState } from "react";
import { errText } from "@/api/client";

export function useCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);

  async function run<T>(p: Promise<{ data?: T; error?: unknown }>) {
    setLoading(true);
    setError(null);
    try {
      const res = await p;
      if (res.error || res.data === undefined) {
        setError(errText(res.error));
        setData(null);
      } else {
        setData(res.data);
      }
    } catch (e) {
      setError(errText(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, data, run };
}
