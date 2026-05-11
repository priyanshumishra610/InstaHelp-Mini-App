import { useCallback, useEffect, useRef, useState } from "react";

import {
  type DeviceAddress,
  type DeviceAddressError,
  LocationFetchError,
  fetchCurrentDeviceAddress,
} from "@/services/locationService";

type Status = "idle" | "loading" | "success" | "error";

export type UseDeviceAddressOptions = {
  /** Run the fetch as soon as the hook mounts. Defaults to false. */
  autoFetch?: boolean;
};

export function useDeviceAddress(options: UseDeviceAddressOptions = {}) {
  const { autoFetch = false } = options;
  const [status, setStatus] = useState<Status>("idle");
  const [address, setAddress] = useState<DeviceAddress | null>(null);
  const [error, setError] = useState<{
    code: DeviceAddressError;
    message: string;
  } | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const next = await fetchCurrentDeviceAddress();
      if (!mountedRef.current) return next;
      setAddress(next);
      setStatus("success");
      return next;
    } catch (err) {
      if (!mountedRef.current) throw err;
      if (err instanceof LocationFetchError) {
        setError({ code: err.code, message: err.message });
      } else {
        setError({
          code: "unknown",
          message:
            err instanceof Error ? err.message : "Could not get your location.",
        });
      }
      setStatus("error");
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      run().catch(() => {});
    }
  }, [autoFetch, run]);

  return {
    address,
    status,
    error,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    refresh: run,
  };
}
