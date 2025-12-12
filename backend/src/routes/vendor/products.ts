import { Hono } from "hono";
import { vendorRole } from "@utils/permissions";

const productsVendor = new Hono();

// NOTE: Authentication and Authorization middleware (e.g., authCheck, checkRole(vendorRole)) is missing. Assuming it will be applied at a higher level or defined later.
// productsVendor.use("*", authCheck, checkRole(vendorRole));

// Get all productsVendor managed by the vendor
productsVendor.get("/", (c) => {
  return c.json({ message: "List of vendor products" });
});

// Create a new product
productsVendor.post("/", (c) => {
  return c.json({ message: "Create product" });
});

// Update an existing product
productsVendor.put("/:id", (c) => {
  const { id } = c.req.param();
  return c.json({ message: `Update product ${id}` });
});

// Delete a product
productsVendor.delete("/:id", (c) => {
  const { id } = c.req.param();
  return c.json({ message: `Delete product ${id}` });
});

export default productsVendor;
