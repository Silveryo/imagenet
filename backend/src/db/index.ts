import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "../env";

const connectionString = env.DATABASE_URL;

export const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
