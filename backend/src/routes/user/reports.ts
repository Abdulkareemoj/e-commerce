import { Hono } from "hono";
import { db } from "@/db";
import { report } from "@/db/schema/report-schema";

const reportsUser = new Hono();

reportsUser.post("/", async (c) => {
  const user = c.get("user") as any;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  if (!body.targetType || !body.targetId || !body.reason) {
    return c.json({ error: "targetType, targetId, and reason are required" }, 400);
  }

  const validTargets = ["product", "vendor", "user"];
  if (!validTargets.includes(body.targetType)) {
    return c.json({ error: "Invalid targetType. Must be product, vendor, or user" }, 400);
  }

  try {
    const id = crypto.randomUUID();
    await db.insert(report).values({
      id,
      userId: user.id,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      description: body.description || null,
    });

    return c.json({ message: "Report submitted", id }, 201);
  } catch (error) {
    console.error("Error creating report:", error);
    return c.json({ error: "Failed to submit report" }, 500);
  }
});

export default reportsUser;
