import { useState } from "react";
import { useSearch, useTree } from "./hooks/queries";

function TreeNode({ node, isRoot = false }: { node: any; isRoot?: boolean }) {
  // Roots are open by default, others closed
  const [isOpen, setIsOpen] = useState(isRoot);

  // Fetch children if we're opened and have children but haven't loaded them deeply
  const { data, isLoading } = useTree(node.fullPath, {
    enabled:
      isOpen &&
      node.hasChildren &&
      (!node.children || node.children.length === 0),
  });

  const childrenToRender =
    data && data.length > 0 && data[0].children
      ? data[0].children
      : node.children || [];

  return (
    <div style={{ marginLeft: isRoot ? 0 : "20px", marginTop: "8px" }}>
      <div
        onClick={() => node.hasChildren && setIsOpen(!isOpen)}
        style={{
          cursor: node.hasChildren ? "pointer" : "default",
          fontWeight: node.hasChildren ? "bold" : "normal",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ width: "16px", display: "inline-block" }}>
          {node.hasChildren ? (isOpen ? "▼" : "▶") : "•"}
        </span>
        {node.name}{" "}
        <span style={{ fontSize: "0.8em", color: "gray" }}>
          ({node.size} items)
        </span>
      </div>

      {isOpen && node.hasChildren && (
        <div>
          {isLoading && (
            <div
              style={{ marginLeft: "20px", color: "gray", fontSize: "0.9em" }}
            >
              Loading...
            </div>
          )}
          {!isLoading &&
            childrenToRender.map((child: any) => (
              <TreeNode key={child.fullPath} node={child} />
            ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearch({ q: debouncedQuery, limit: 10 });

  const {
    data: rootNodes,
    isLoading: isTreeLoading,
    error: treeError,
  } = useTree();

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>ImageNet Taxonomy</h1>

      <section>
        <h2>Search</h2>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search..."
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={() => setDebouncedQuery(searchQuery)}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Search
          </button>
        </div>

        {isSearchLoading && debouncedQuery && <p>Loading search results...</p>}
        {searchError && (
          <p style={{ color: "red" }}>Error: {searchError.message}</p>
        )}

        {searchResults && (
          <ul>
            {searchResults.length === 0 ? (
              <li>No results found for "{debouncedQuery}"</li>
            ) : (
              searchResults.map((result: any, i: number) => (
                <li key={i}>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      <hr style={{ margin: "32px 0" }} />

      <section>
        <h2>Taxonomy Tree</h2>
        {isTreeLoading && <p>Loading tree data...</p>}
        {treeError && (
          <p style={{ color: "red" }}>Error: {treeError.message}</p>
        )}

        {rootNodes && (
          <div
            style={{
              background: "#f5f5f5",
              padding: "16px",
              borderRadius: "4px",
            }}
          >
            {rootNodes.map((node: any) => (
              <TreeNode key={node.fullPath} node={node} isRoot={true} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
