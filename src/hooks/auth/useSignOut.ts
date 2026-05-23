import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useSignOut() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await signOut();
    queryClient.clear();
  }, [queryClient, signOut]);
}
