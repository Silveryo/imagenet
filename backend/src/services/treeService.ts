import { db } from "../db";
import { nodes } from "../db/schema";
import type { LinearNode, TreeNode } from "./treeBuilder";

let inMemoryLinearData: LinearNode[] | null = null;
export let completeTreeMap: Record<string, TreeNode> | null = null;
export let rootNodes: TreeNode[] | null = null;

export async function loadTreeData() {
  if (!inMemoryLinearData) {
    console.log("Fetching linear data from DB...");
    inMemoryLinearData = await db.select().from(nodes);
    
    console.log("Building full tree map in memory...");
    const map: Record<string, TreeNode> = {};
    const roots: TreeNode[] = [];

    // O(N*L) time complexity tree builder
    for (const item of inMemoryLinearData) {
      const parts = item.name.split(" > ");
      const localName = parts[parts.length - 1] ?? "";

      map[item.name] = {
        name: parts.length === 1 ? (parts[0] ?? "") : localName,
        fullPath: item.name,
        size: item.size,
        hasChildren: item.size > 0,
        children: [],
      };
    }

    for (const item of inMemoryLinearData) {
      const parts = item.name.split(" > ");
      const targetNode = map[item.name];
      if (!targetNode) continue;

      if (parts.length === 1) {
        roots.push(targetNode);
      } else {
        const pPath = parts.slice(0, -1).join(" > ");
        const parentNode = map[pPath];
        if (parentNode && parentNode.children) {
          parentNode.children.push(targetNode);
        } else {
          roots.push(targetNode);
        }
      }
    }
    
    completeTreeMap = map;
    rootNodes = roots;
    console.log("Tree built successfully.");
  }
}

// Deep clone a node safely up to a certain depth (1 level of children)
export function serializeNode(node: TreeNode, includeChildren: boolean): any {
  return {
    name: node.name,
    fullPath: node.fullPath,
    size: node.size,
    hasChildren: node.hasChildren,
    children: includeChildren && node.children ? node.children.map(c => serializeNode({ ...c, children: [] }, false)) : []
  };
}
