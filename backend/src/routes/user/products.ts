import { Hono } from "hono";

const productsRoutes = new Hono();

productsRoutes.get("/", (c) => {
  // logic to get user products
  return c.json({ products: "user products data" });
});

export default productsRoutes;
