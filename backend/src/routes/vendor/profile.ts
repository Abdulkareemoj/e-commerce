import { Hono } from "hono";

const profileVendor = new Hono();

profileVendor.get("/", (c) => {
  // logic to get user profile
  return c.json({ user: "profile data" });
});

profileVendor.put("/", (c) => {
  // logic to update user profile
  return c.json({ message: "Profile updated successfully" });
});

export default profileVendor;
