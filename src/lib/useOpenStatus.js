import { useEffect, useState } from "react";
import { getOpenStatus } from "./hours";

// Open/closed status, refreshed every minute.
export function useOpenStatus() {
  const [status, setStatus] = useState(() => getOpenStatus());
  useEffect(() => {
    const id = setInterval(() => setStatus(getOpenStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}
