import { env } from "./env";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { apiRoutes } from "./api";

export const app = new Elysia()
  .use(cors())
  .use(openapi({
    documentation: {
        info: {
            title: "ImageNet Explorer API",
            description: "API for exploring ImageNet hierarchy and searching nodes",
            version: "1.0.0"
        }
    }
  }))
  .use(apiRoutes)
  .listen(env.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`Scalar is accessible at http://localhost:${env.PORT}/openapi`);


export type App = typeof app;