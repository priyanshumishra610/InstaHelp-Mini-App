import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { persistProfile, refreshProfile } from "@/services/profileService";
import type { UserProfile } from "@/types/user";

export function profileKey(phone: string | null) {
  return ["profile", phone ?? "anon"] as const;
}

export function useProfileQuery() {
  const phone = useAuthPhone();
  return useQuery({
    queryKey: profileKey(phone),
    queryFn: () => refreshProfile(),
    enabled: !!phone,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  const phone = useAuthPhone();
  return useMutation({
    mutationFn: (next: UserProfile) => persistProfile(next),
    onSuccess: (data) => {
      qc.setQueryData(profileKey(phone), data);
    },
  });
}
