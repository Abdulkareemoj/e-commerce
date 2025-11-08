import { Hono } from "hono";

const productsRoutes = new Hono();

productsRoutes.get("/", (c) => {
  // logic to get user products
  return c.json({ products: "user products data" });
});

productsRoutes.post("/add", (c) => {
  // logic to add a product
  return c.json({ message: "Product added successfully" });
});
export default productsRoutes;
