import { Hono } from "hono";

const cartUser = new Hono();
cartUser.get("/", (c) => {
  // logic to get user cart
  return c.json({ cart: "user cart data" });
});

cartUser.post("/add", (c) => {
  // logic to add item to cart
  return c.json({ message: "Item added to cart successfully" });
});
cartUser.post("/remove", (c) => {
  // logic to remove item from cart
  return c.json({ message: "Item removed from cart successfully" });
});

export default cartUser;
