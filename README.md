# 🌳 ImageNet Taxonomy Viewer

A blazing-fast, strictly-typed full-stack taxonomy explorer for the ImageNet dataset. Transfers massive hierarchical XML data into a sleek, searchable, and lazy-loaded UI.

UI is deployed on Railway: https://fe-production-cd55.up.railway.app/

For about 2 more weeks since this commit.

## 🚀 Running Locally

The entire stack is containerized for zero-friction setup.

```bash
docker-compose up -d --build
```

*(Alternatively, run `bun i` followed by `bun dev` in both the backend and frontend directories.)*

## 🧠 Design Decisions & Trade-offs

- **Lazy Loading over Full-Tree Transfer:** Sending a 60,000+ node tree structure in one request breaks both network capabilities and DOM performance. I opted to generate limited fractional sub-trees recursively upon node expansion requests.
- **Backend Tree Reconstruction Algorithm:**
  - **Time Complexity:** $\mathcal{O}(N \cdot L)$ where $N$ is the dataset size and $L$ is the average string path length (from `" > "` splits). Using a reference hash map, we connect children to parents in a subsequent pass, completely sidestepping terrible $\mathcal{O}(N^2)$ recursive searches.
  - **Space Complexity:** $\mathcal{O}(N)$ to temporarily hold the node map during the initial build phase before pruning and finalizing the output payload.
- **Search Strategy:** Search hits the database aggressively (`ILIKE` filtering) to find text matches. Returning just the exact paths needed prevents clientside freezing that normally occurs with huge DOM trees.
- 
## ✨ Most Proud Of

- **End-to-End Type Safety:** TypeScript throughout, powered by Bun, Elysia, Drizzle ORM, and React.
- **Lazy-Loaded Tree Exploration:** The backend reconstructs precise tree fragments on the fly, preventing massive network payloads and ensuring rapid frontend rendering.
- **FE Tree View:** Collapsible tree components with search functionality, built with React and some tanstack packages. After adding some styling it became laggy... too many nodes! I added virtualization.

## 🛠️ Some TODOs

- In general better project config (tsconfig, lint+format like Oxc ...)
- Maybe tests but since I didn't do TDD, there's no point because nobody will be extending this codebase.
- Better UI/UX. It works on desktop and mobile, but I didn't really think about what an "user" would like to do in this app, so it's pretty barebones. I just wanted to see the taxonomy tree and search it, which is what it does.
  
