import { Hono } from "hono";

const messagingUser = new Hono();
messagingUser.get("/", (c) => {
  // logic to get user messages
  return c.json({ messages: "user messages data" });
});
messagingUser.post("/send", (c) => {
  // logic to send a message
  return c.json({ message: "Message sent successfully" });
});

export default messagingUser;
