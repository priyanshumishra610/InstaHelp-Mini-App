import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/store/authStore";
import { persistProfile, refreshProfile } from "@/services/profileService";
import type { UserProfile } from "@/types/user";

export function profileKey(phone: string | null) {
  return ["profile", phone ?? "anon"] as const;
}

export function useProfileQuery() {
  const phone = useAuthStore((s) => s.phone);
  return useQuery({
    queryKey: profileKey(phone),
    queryFn: () => refreshProfile(),
    enabled: !!phone,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  const phone = useAuthStore((s) => s.phone);
  return useMutation({
    mutationFn: (next: UserProfile) => persistProfile(next),
    onSuccess: (data) => {
      qc.setQueryData(profileKey(phone), data);
    },
  });
}
