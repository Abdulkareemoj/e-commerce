import { Hono } from "hono";

const profileRoutes = new Hono();

profileRoutes.get("/", (c) => {
  // logic to get user profile
  return c.json({ user: "profile data" });
});

profileRoutes.put("/", (c) => {
  // logic to update user profile
  return c.json({ message: "Profile updated successfully" });
});

export default profileRoutes;
