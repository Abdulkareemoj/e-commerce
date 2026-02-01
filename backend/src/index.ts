import { Hono } from "hono";
import api from "./routes";
import { auth } from "./utils/auth";
type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { pinoLogger } from "hono-pino";
import pino from "pino";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const port = Number(process.env.PORT) || 8000;
const app = new Hono<{ Variables: AppVariables }>();

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return await next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

// Create pino logger instance
const log = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// Add pino logger middleware
app.use("*", pinoLogger({ pino: log }));

app.use(
  "/api/auth/*",
  cors({
    origin:
      process.env.NODE_ENV === "production" && process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN
        : "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const req = c.req.raw;
  const headers = new Headers(req.headers);

  if (!headers.get("origin")) {
    const expoOrigin = headers.get("expo-origin");
    if (expoOrigin) {
      headers.set("origin", expoOrigin);
    } else {
      const host = headers.get("host");
      if (host) {
        headers.set("origin", `http://${host}`);
      }
    }
  }

  const forwarded = new Request(
    req as any,
    {
      headers,
      ...(req.method !== "GET" && req.method !== "HEAD"
        ? { duplex: "half" }
        : {}),
    } as any,
  );

  return auth.handler(forwarded);
});

app.get("/health", (c) => c.text("OK"));

app.route("/api", api);

const server = serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});

// Log startup messages
log.info(`Server is running at http://localhost:${port}`);
log.info(`Health check available at http://localhost:${port}/health`);

// graceful shutdown
process.on("SIGINT", () => {
  server.close((err: any) => {
    if (err) {
      log.error(err);
      process.exit(1);
    }
    log.info("Server shut down gracefully");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close((err: any) => {
    if (err) {
      log.error(err);
      process.exit(1);
    }
    log.info("Server shut down gracefully");
    process.exit(0);
  });
});
