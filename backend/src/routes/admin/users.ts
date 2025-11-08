import { Hono } from "hono";

const usersRoutes = new Hono();
usersRoutes.get("/list", (c) => {
  return c.json({ users: ["user1", "user2", "user3"] });
});

export default usersRoutes;
