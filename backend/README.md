# backend

To install dependencies:

```bash
bun install
```

To run the API:

```bash
bun run dev
```

To ingest XML data into the database:

```bash
# Uses the default data file at ../data/structure_released.xml
bun run ingest

# Or specify a custom XML file target
bun run src/scripts/ingest.ts "../data/custom_structure.xml"
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
