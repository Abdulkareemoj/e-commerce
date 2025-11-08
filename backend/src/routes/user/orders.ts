import { Hono } from "hono";

const ordersRoutes = new Hono();

ordersRoutes.get("/", (c) => {
  // logic to get user orders
  return c.json({ orders: "user orders data" });
});

export default ordersRoutes;
