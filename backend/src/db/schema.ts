import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";

export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g. "A > B > C"
  size: integer("size").notNull().default(0),
});
