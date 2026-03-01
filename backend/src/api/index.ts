import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "../db";
import { nodes } from "../db/schema";
import { like } from "drizzle-orm";
import {
  loadTreeData,
  rootNodes,
  completeTreeMap,
  serializeNode,
} from "../services/treeService";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .get(
    "/tree",
    async ({ query }) => {
      await loadTreeData();

      const parentPath = query.parentPath;

      if (!parentPath) {
        // Return root nodes and their immediate children
        if (!rootNodes) return [];

        return rootNodes.map((r) => serializeNode(r, true));
      }

      const requestedNode = completeTreeMap![parentPath];
      if (!requestedNode) {
        return null;
      }

      return [serializeNode(requestedNode, true)];
    },
    {
      query: z.object({
        parentPath: z.string().optional(),
      }),
    },
  )
  .get(
    "/search",
    async ({ query }) => {
      // Fast search using DB ILIKE
      const q = query.q || "";
      if (q.length < 2) return [];

      const limit = query.limit || 20;

      const results = await db
        .select()
        .from(nodes)
        .where(like(nodes.name, `%${q}%`))
        .limit(limit);
      return results.map((r) => {
        const parts = r.name.split(" > ");
        return {
          fullPath: r.name,
          localName: parts[parts.length - 1],
          size: r.size,
        };
      });
    },
    {
      query: z.object({
        q: z.string(),
        limit: z.coerce.number().min(1).max(100).optional().default(20),
      }),
    },
  );
