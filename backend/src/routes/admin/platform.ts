import { Hono } from "hono";

const platformRoutes = new Hono();

platformRoutes.get("/platform-info", (c) => {
  return c.json({ platform: "Admin Platform", version: "1.0.0" });
});

export default platformRoutes;
