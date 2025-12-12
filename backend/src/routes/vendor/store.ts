import { Hono } from "hono";

const storeVendor = new Hono();

// Route for getting vendor store details
storeVendor.get("/", (c) => {
  return c.json({ message: "Get vendor store details endpoint" });
});

// Route for updating vendor store details
storeVendor.put("/", (c) => {
  return c.json({ message: "Update vendor storVendor details endpoint" });
});

export default storeVendor;
