import { Hono } from "hono";

const ordersVendor = new Hono();

// List all ordersVendor for the vendor
ordersVendor.get("/", (c) => {
  return c.json({ message: "List of vendor ordersVendor" });
});

// Get a specific order
ordersVendor.get("/:id", (c) => {
  const { id } = c.req.param();
  return c.json({ message: `Vendor order ${id}` });
});

// Update order status (e.g., shipped, delivered)
ordersVendor.put("/:id", (c) => {
  const { id } = c.req.param();
  return c.json({ message: `Update status for order ${id}` });
});

export default ordersVendor;
