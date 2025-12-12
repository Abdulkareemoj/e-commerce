import { Hono } from "hono";

const profileUser = new Hono();

profileUser.get("/", (c) => {
  // logic to get user profile
  return c.json({ user: "profile data" });
});

profileUser.put("/", (c) => {
  // logic to update user profile
  return c.json({ message: "Profile updated successfully" });
});

export default profileUser;
