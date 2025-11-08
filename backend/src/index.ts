import { Hono } from "hono";  
import api from "./routes";  
import { auth } from "./utils/auth";  
import { serve } from "@hono/node-server";  
import { cors } from "hono/cors";  
import { pinoLogger } from "hono-pino";  
import pino from "pino";  
import dotenv from 'dotenv'  
  
dotenv.config({ path: '.env' })  
  
const port = Number(process.env.PORT) || 8000;  
const app = new Hono();  
  
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
    origin: process.env.CORS_ORIGIN!,  
    allowHeaders: ["Content-Type", "Authorization"],  
    allowMethods: ["POST", "GET", "OPTIONS"],  
    exposeHeaders: ["Content-Length"],  
    maxAge: 600,  
    credentials: true,  
  })  
);  
  
app.on(["POST", "GET"], "/api/auth/*", (c) => {  
  return auth.handler(c.req.raw);  
});  
  
app.get("/health", (c) => c.text("OK"));  
  
app.route("/api", api);  
  
const server = serve({  
  fetch: app.fetch,  
  port,  
});  
  
// Log startup messages  
log.info(`Server is running at http://localhost:${port}`);  
log.info(`Health check available at http://localhost:${port}/health`);  

  
// graceful shutdown  
process.on('SIGINT', () => {  
  server.close((err: any) => {  
    if (err) {  
      log.error(err);  
      process.exit(1);  
    }  
    log.info('Server shut down gracefully');  
    process.exit(0);  
  });  
});  
  
process.on('SIGTERM', () => {  
  server.close((err: any) => {  
    if (err) {  
      log.error(err);  
      process.exit(1);  
    }  
    log.info('Server shut down gracefully');  
    process.exit(0);  
  });  
});