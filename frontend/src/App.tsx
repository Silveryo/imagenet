import { useState, useCallback, useEffect } from "react";
import { useSearch, useTree, client } from "./hooks/queries";
import TreeView from "./components/tree-view";
import type { TreeViewItem } from "./components/tree-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Root tree nodes fetch
  const { data: rootNodes, isLoading: isTreeLoading, error: treeError } = useTree();

  const [treeData, setTreeData] = useState<TreeViewItem[]>([]);

  // Initialize tree
  useEffect(() => {
    if (rootNodes) {
      const convert = (nodes: any[]): TreeViewItem[] => {
        return nodes.map((node) => ({
          id: node.fullPath,
          name: `${node.name} (${node.size.toLocaleString()} items)`,
          type: node.hasChildren ? "folder" : "file",
          children: node.hasChildren ? [] : undefined,
        }));
      };
      setTreeData(convert(rootNodes));
    }
  }, [rootNodes]);

  const updateNodeChildren = (nodes: TreeViewItem[], id: string, newChildren: TreeViewItem[]): TreeViewItem[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, children: newChildren };
      }
      if (node.children) {
        return { ...node, children: updateNodeChildren(node.children, id, newChildren) };
      }
      return node;
    });
  };

  const handleToggleExpand = useCallback(async (id: string, isOpen: boolean) => {
    if (isOpen) {
      // Find the node
      const findNode = (nodes: TreeViewItem[], targetId: string): TreeViewItem | null => {
        for (const n of nodes) {
          if (n.id === targetId) return n;
          if (n.children) {
            const found = findNode(n.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const node = findNode(treeData, id);
      // Only fetch if folder has children but array is empty
      if (node && node.children && node.children.length === 0) {
        const result = await client.api.tree.get({ query: { parentPath: id } });
        if (result.data && result.data[0]) {
          const childrenData = result.data[0].children || [];
          const newChildren = childrenData.map((child: any) => ({
            id: child.fullPath,
            name: `${child.name} (${child.size.toLocaleString()} items)`,
            type: child.hasChildren ? "folder" : "file",
            children: child.hasChildren ? [] : undefined,
          }));
          setTreeData((prev) => updateNodeChildren(prev, id, newChildren));
        }
      }
    }
  }, [treeData]);

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearch({ q: debouncedQuery, limit: 4 });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">ImageNet Taxonomy</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Explore the ImageNet hierarchical structure.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-800">Search</h2>
              <div className="flex flex-col gap-3 mb-4">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query taxonomy..."
                  className="w-full bg-slate-50/50"
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        setDebouncedQuery(searchQuery);
                     }
                  }}
                />
                <Button 
                  onClick={() => setDebouncedQuery(searchQuery)}
                  className="w-full"
                >
                  Search
                </Button>
              </div>

              {isSearchLoading && debouncedQuery && (
                <div className="text-sm text-slate-500 animate-pulse">Searching...</div>
              )}
              {searchError && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                  {searchError.message}
                </div>
              )}

              {searchResults && (
                <div className="space-y-3 mt-6">
                  {searchResults.length === 0 ? (
                    <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg">
                      No results found for "{debouncedQuery}"
                    </div>
                  ) : (
                    searchResults.map((result: any, i: number) => {
                      const pathParts = result.fullPath ? result.fullPath.split(' > ') : [];
                      
                      return (
                        <div key={i} className="p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 rounded-xl text-sm flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-3">
                            <div className="font-semibold text-slate-900 leading-tight">
                              {result.localName || result.name || "Unknown"}
                            </div>
                            <Badge variant="secondary" className="shrink-0 bg-slate-200/50 text-slate-700 hover:bg-slate-200/50 rounded-md">
                              {result.size.toLocaleString()} items
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-slate-500 break-words leading-relaxed" title={result.fullPath}>
                            {pathParts.map((part: string, idx: number) => (
                              <span key={idx}>
                                <span className="hover:text-slate-800 transition-colors">{part}</span>
                                {idx < pathParts.length - 1 && (
                                  <span className="mx-1.5 text-slate-300 select-none">&gt;</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-3">
            <section className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-slate-800">Taxonomy Tree</h2>
                {isTreeLoading && (
                  <Badge variant="outline" className="animate-pulse">Loading...</Badge>
                )}
              </div>
              
              {treeError && (
                <div className="text-sm text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                  {treeError.message}
                </div>
              )}

              {!isTreeLoading && treeData.length > 0 && (
                <div className="w-full">
                  <TreeView 
                    data={treeData} 
                    onToggleExpand={handleToggleExpand}
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
