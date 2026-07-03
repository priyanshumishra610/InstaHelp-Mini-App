import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  clearDealsCache,
  fetchDealSections,
  fetchDealsPage,
  getDealById,
  searchDeals,
} from "@/features/deals/services/dealsService";
import type { DealCategoryId } from "@/features/deals/types/dealTypes";

export const dealsQueryKeys = {
  all: ["deals"] as const,
  sections: () => [...dealsQueryKeys.all, "sections"] as const,
  page: (categoryId?: DealCategoryId, search?: string) =>
    [...dealsQueryKeys.all, "page", categoryId ?? "all", search ?? ""] as const,
  search: (q: string) => [...dealsQueryKeys.all, "search", q] as const,
  detail: (id: string) => [...dealsQueryKeys.all, "detail", id] as const,
};

export function useDealSections() {
  return useQuery({
    queryKey: dealsQueryKeys.sections(),
    queryFn: () => fetchDealSections(false),
    staleTime: 5 * 60_000,
  });
}

export function useDealsInfinite(options?: {
  categoryId?: DealCategoryId;
  search?: string;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: dealsQueryKeys.page(options?.categoryId, options?.search),
    enabled: options?.enabled !== false,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchDealsPage({
        page: pageParam,
        categoryId: options?.categoryId,
        search: options?.search,
      }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 5 * 60_000,
  });
}

export function useDealSearch(query: string, enabled = true) {
  const q = query.trim();
  return useQuery({
    queryKey: dealsQueryKeys.search(q),
    queryFn: () => searchDeals(q),
    enabled: enabled && q.length > 0,
    staleTime: 60_000,
  });
}

export function useDealDetail(dealId: string | null) {
  return useQuery({
    queryKey: dealsQueryKeys.detail(dealId ?? ""),
    queryFn: async () => {
      if (!dealId) return null;
      const { deals } = await fetchDealsPage({ page: 1 });
      return getDealById(dealId, deals) ?? null;
    },
    enabled: Boolean(dealId),
  });
}

export function useRefreshDeals() {
  const qc = useQueryClient();
  return async () => {
    clearDealsCache();
    await qc.invalidateQueries({ queryKey: dealsQueryKeys.all });
  };
}
