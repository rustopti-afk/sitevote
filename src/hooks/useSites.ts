"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { Site, SiteFilters } from "@/types/site.types";
import type { ApiResponse } from "@/types/api.types";
import type { Category } from "@/types/site.types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const siteKeys = {
  all: ["sites"] as const,
  lists: () => [...siteKeys.all, "list"] as const,
  list: (filters: SiteFilters) => [...siteKeys.lists(), filters] as const,
  detail: (id: string) => [...siteKeys.all, "detail", id] as const,
  categories: ["categories"] as const,
};

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchSites(filters: SiteFilters): Promise<ApiResponse<Site[]>> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.pageSize !== undefined)
    params.set("pageSize", String(filters.pageSize));

  const query = params.toString();
  const res = await fetch(`/api/sites${query ? `?${query}` : ""}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch sites: ${res.status}`);
  }

  return res.json() as Promise<ApiResponse<Site[]>>;
}

async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  const res = await fetch("/api/categories");

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }

  return res.json() as Promise<ApiResponse<Category[]>>;
}

async function voteSite(siteId: string): Promise<ApiResponse<{ voted: boolean }>> {
  const res = await fetch(`/api/sites/${siteId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to vote: ${res.status}`);
  }

  return res.json() as Promise<ApiResponse<{ voted: boolean }>>;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetch a list of sites with optional filters.
 */
export function useSites(filters: SiteFilters = {}) {
  return useQuery({
    queryKey: siteKeys.list(filters),
    queryFn: () => fetchSites(filters),
  });
}

/**
 * Fetch all categories. Cached for 5 minutes.
 */
export function useCategories() {
  return useQuery({
    queryKey: siteKeys.categories,
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Vote mutation with optimistic updates for a given site.
 * - onMutate: cancels in-flight queries and immediately updates the cache
 * - onError: reverts the cache to the previous snapshot
 * - onSettled: invalidates affected queries to sync with the server
 */
export function useVoteMutation(siteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => voteSite(siteId),

    onMutate: async () => {
      // Cancel all outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: siteKeys.lists() });
      await queryClient.cancelQueries({ queryKey: siteKeys.detail(siteId) });

      // Snapshot current list queries for potential rollback
      const previousListData = queryClient.getQueriesData<ApiResponse<Site[]>>({
        queryKey: siteKeys.lists(),
      });

      // Snapshot current detail query
      const previousDetail = queryClient.getQueryData<ApiResponse<Site>>(
        siteKeys.detail(siteId)
      );

      // Optimistically update all list caches that contain this site
      queryClient.setQueriesData<ApiResponse<Site[]>>(
        { queryKey: siteKeys.lists() },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((site) =>
              site.id === siteId
                ? {
                    ...site,
                    voteCount: site.hasVoted
                      ? site.voteCount - 1
                      : site.voteCount + 1,
                    hasVoted: !site.hasVoted,
                  }
                : site
            ),
          };
        }
      );

      // Optimistically update the detail cache if present
      if (previousDetail?.data) {
        queryClient.setQueryData<ApiResponse<Site>>(
          siteKeys.detail(siteId),
          (old) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: {
                ...old.data,
                voteCount: old.data.hasVoted
                  ? old.data.voteCount - 1
                  : old.data.voteCount + 1,
                hasVoted: !old.data.hasVoted,
              },
            };
          }
        );
      }

      return { previousListData, previousDetail };
    },

    onError: (_error, _variables, context) => {
      if (!context) return;

      // Revert list caches
      for (const [queryKey, data] of context.previousListData) {
        queryClient.setQueryData(queryKey as QueryKey, data);
      }

      // Revert detail cache
      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(siteKeys.detail(siteId), context.previousDetail);
      }
    },

    onSettled: () => {
      // Sync with server after mutation completes (success or failure)
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.detail(siteId) });
    },
  });
}
