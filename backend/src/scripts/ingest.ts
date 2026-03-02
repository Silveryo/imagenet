import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "fs";
import { db } from "../db";
import { nodes } from "../db/schema";
import { sql } from "drizzle-orm";
import path from "path";
import { z } from "zod";

console.log("Reading XML file...");

// Allow passing XML path via arg, otherwise use default
const argsSchema = z.object({
  xmlPath: z
    .string()
    .default(path.resolve(__dirname, "../../../data/structure_released.xml")),
});

const parsedArgs = argsSchema.parse({
  xmlPath: process.argv[2],
});

const xmlFilePath = path.resolve(parsedArgs.xmlPath);

console.log(`Using XML file at: ${xmlFilePath}`);
const xmlData = readFileSync(xmlFilePath, "utf8");

console.log("Parsing XML...");
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  isArray: (name) => name === "synset",
});
const parsed = parser.parse(xmlData);

// Structural schema validation could be added here (e.g., using Zod on the `parsed` object).
// fast-xml-parser's built-in XMLValidator only checks for well-formedness, not expected schema.

type LinearNode = {
  name: string;
  size: number;
};
const linearData: LinearNode[] = [];

// Recursive traversal to flatten the tree and calculate size
console.log("Flattening tree...");
function traverse(node: any, parentPath: string): number {
  const nodeWords = node.words || "";
  const currentPath = parentPath ? `${parentPath} > ${nodeWords}` : nodeWords;

  let size = 0;
  const children = node.synset || [];

  for (const child of children) {
    size += 1 + traverse(child, currentPath);
  }

  linearData.push({ name: currentPath, size });
  return size;
}

// Start with the top-level synset
const rootSynset = parsed.ImageNetStructure.synset[0];
traverse(rootSynset, "");

const uniqueData = Array.from(
  new Map(linearData.map((item) => [item.name, item])).values(),
);

console.log(
  `Flattened down to ${uniqueData.length} unique nodes. Inserting into DB...`,
);

async function ingest() {
  const countResult = await db.execute(sql`SELECT count(*) FROM nodes`);
  const count = Number(countResult[0]?.count || 0);

  if (count > 0) {
    console.log("Database already populated. Skipping ingestion.");
    process.exit(0);
  }

  const BATCH_SIZE = 5000;
  let inserted = 0;

  for (let i = 0; i < uniqueData.length; i += BATCH_SIZE) {
    const chunk = uniqueData.slice(i, i + BATCH_SIZE);
    await db
      .insert(nodes)
      .values(chunk)
      .onConflictDoNothing({ target: nodes.name });
    inserted += chunk.length;
    console.log(`Inserted ${inserted} / ${uniqueData.length}`);
  }

  console.log("Ingestion complete.");
  process.exit(0);
}

ingest().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
