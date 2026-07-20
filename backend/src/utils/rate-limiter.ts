import { rateLimiter } from "hono-rate-limiter";
import type { Context } from "hono";

export function rateLimit({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}) {
  return rateLimiter({
    windowMs,
    limit: max,
    keyGenerator: (c: Context) => {
      const user = c.get("user") as any;
      return (
        user?.id ??
        c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
        "anon"
      );
    },
    // MemoryStore by default — fine for your current single-instance setup.
    // If you ever go multi-instance behind nginx, swap in RedisStore here
    // and every call site below stays unchanged.
  });
}