import { Hono } from "hono";

const messagingVendor = new Hono();
messagingVendor.get("/", (c) => {
  // logic to get user messages
  return c.json({ messages: "user messages data" });
});
messagingVendor.post("/send", (c) => {
  // logic to send a message
  return c.json({ message: "Message sent successfully" });
});

export default messagingVendor;
