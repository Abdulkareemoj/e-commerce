import { Hono } from "hono";

const cartRoutes = new Hono();
cartRoutes.get("/", (c) => {
  // logic to get user cart
  return c.json({ cart: "user cart data" });
});

cartRoutes.post("/add", (c) => {
  // logic to add item to cart
  return c.json({ message: "Item added to cart successfully" });
});
cartRoutes.post("/remove", (c) => {
  // logic to remove item from cart
  return c.json({ message: "Item removed from cart successfully" });
});

export default cartRoutes;
