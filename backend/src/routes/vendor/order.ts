import { Hono } from "hono";

const orderRoutes = new Hono();

orderRoutes.get("/", (c) => {
  // logic to get user orders
  return c.json({ orders: "user orders data" });
});

export default orderRoutes;
