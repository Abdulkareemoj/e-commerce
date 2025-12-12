import { Hono } from "hono";

const payoutsVendor = new Hono();

// List all payout requests and history
payoutsVendor.get("/", (c) => {
  return c.json({ message: "List of vendor payouts" });
});

// Request a new payout
payoutsVendor.post("/", (c) => {
  return c.json({ message: "Request new payout" });
});

export default payoutsVendor;
