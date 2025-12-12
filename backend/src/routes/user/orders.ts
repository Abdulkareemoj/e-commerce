import { Hono } from "hono";

const ordersUser = new Hono();

ordersUser.get("/", (c) => {
  // logic to get user orders
  return c.json({ orders: "user orders data" });
});

export default ordersUser;
