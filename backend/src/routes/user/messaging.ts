import { Hono } from "hono";

const messagingRoutes = new Hono();
messagingRoutes.get("/", (c) => {
  // logic to get user messages
  return c.json({ messages: "user messages data" });
});
messagingRoutes.post("/send", (c) => {
  // logic to send a message
  return c.json({ message: "Message sent successfully" });
});

export default messagingRoutes;
