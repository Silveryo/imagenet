export type LinearNode = {
  name: string;
  size: number;
};

export type TreeNode = {
  name: string;
  size: number;
  hasChildren: boolean;
  children?: TreeNode[];
};

/**
 * Builds a limited view of the tree returning only the nodes up to a certain depth relative to the given parent.
 *
 * Algorithm Complexity:
 * - Time: O(N * L) where N is the number of linear records, and L is the average number of parts in a path split by " > ".
 *   (Strictly, iterating over N elements and performing string splits takes O(N * max_path_length) time).
 * - Space: O(N) to store the mapping of all elements initially before garbage collection/pruning to the requested size.
 */
export function buildTreeFragment(
  linearData: LinearNode[],
  parentPath: string | null
): TreeNode[] {
  const map: Record<string, TreeNode> = {};
  const roots: TreeNode[] = [];

  for (const item of linearData) {
    const parts = item.name.split(" > ");
    const lastPart = parts[parts.length - 1] ?? "";
    const localName = parts.length === 1 && !parentPath ? (parts[0] ?? "") : lastPart;

    map[item.name] = {
      name: localName,
      size: item.size,
      hasChildren: item.size > 0,
      children: [],
    };
  }

  // Connect parent to child
  for (const item of linearData) {
    const parts = item.name.split(" > ");
    const targetNode = map[item.name];
    if (!targetNode) continue;
    
    if (parts.length === 1) {
      // It's a true root node
      roots.push(targetNode);
    } else {
      const pPath = parts.slice(0, -1).join(" > ");
      const parentNode = map[pPath];
      if (parentNode && parentNode.children) {
        parentNode.children.push(targetNode);
      } else {
        // Fallback safety if DB structure is orphaned
        roots.push(targetNode);
      }
    }
  }

  // Since it's huge, we don't want to return the whole tree.
  // Instead, return the direct children of the `parentPath`.
  // And strip grandchildren to prevent massive payload.
  
  const getSubtree = (paths: TreeNode[]) => {
      // Strip grandchildren
      for (const t of paths) {
          if (t.children) {
              for (const child of t.children) {
                  delete child.children; // Do not return deeper nesting than 1 level
              }
          }
      }
      return paths;
  }

  if (!parentPath) {
    // Returning only roots and their immediate children
    return getSubtree(roots);
  }

  // Return the specific node requested, along with its children
  const requestedNode = map[parentPath];
  if (!requestedNode) return [];

  // Strip grandchildren of the requested node's children
  if (requestedNode.children) {
      for (const child of requestedNode.children) {
          delete child.children;
      }
  }
  
  return [requestedNode];
}
