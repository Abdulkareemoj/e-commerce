import { Hono } from "hono";

const vendorsRoutes = new Hono();

vendorsRoutes.get("/list", (c) => {
  return c.json({ vendors: ["vendor1", "vendor2", "vendor3"] });
});

export default vendorsRoutes;
