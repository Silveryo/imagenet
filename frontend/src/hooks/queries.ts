import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { treaty } from "@elysiajs/eden";
import type { App } from "../../../backend/src/index";

//TODO 
export const client = treaty<App>("http://localhost:3000");

export const queryKeys = {
  search: (q: string, limit?: number) => ["search", q, limit] as const,
  tree: (parentPath?: string) => ["tree", parentPath] as const,
};

export function useSearch(
  params: { q: string; limit?: number },
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.search(params.q, params.limit),
    queryFn: async () => {
      const { data, error } = await client.api.search.get({
        query: {
          q: params.q,
          limit: params.limit ?? 10,
        },
      });
      if (error)
        throw new Error(
          String(error.value ?? "Failed to fetch search results"),
        );
      return data;
    },
    enabled: Boolean(params.q),
    ...options,
  });
}

export function useTree(
  parentPath?: string,
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.tree(parentPath),
    queryFn: async () => {
      const { data, error } = await client.api.tree.get({
        query: { parentPath },
      });
      if (error) throw new Error(String(error.value ?? "Failed to fetch tree"));
      return data;
    },
    ...options,
  });
}
