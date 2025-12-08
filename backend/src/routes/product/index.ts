import { Hono } from "hono";

const productPublicRoutes = new Hono();

productPublicRoutes.get("/", (c) => {
  // Logic to get all public products
  return c.json({ products: "all public products data" });
});

productPublicRoutes.get("/:id", (c) => {
    const id = c.req.param("id");
    // Logic to get a specific public product by ID
    return c.json({ product: `public product data for ID: ${id}` });
});

export default productPublicRoutes;