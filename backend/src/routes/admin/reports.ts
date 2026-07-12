import { Hono } from "hono";
import { db } from "@/db";
import { report } from "@/db/schema/report-schema";
import { eq, desc, and } from "drizzle-orm";

const reportsAdmin = new Hono();

reportsAdmin.get("/", async (c) => {
  try {
    const status = c.req.query("status");
    const conditions = [];
    if (status) conditions.push(eq(report.status, status));

    const reports = await db.query.report.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(report.createdAt)],
      with: {
        user: { columns: { id: true, name: true, email: true } },
        resolver: { columns: { id: true, name: true } },
      },
    });

    return c.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return c.json({ error: "Failed to fetch reports" }, 500);
  }
});

reportsAdmin.get("/:id", async (c) => {
  try {
    const rep = await db.query.report.findFirst({
      where: eq(report.id, c.req.param("id")),
      with: {
        user: { columns: { id: true, name: true, email: true } },
        resolver: { columns: { id: true, name: true } },
      },
    });

    if (!rep) return c.json({ error: "Report not found" }, 404);
    return c.json({ report: rep });
  } catch (error) {
    console.error("Error fetching report:", error);
    return c.json({ error: "Failed to fetch report" }, 500);
  }
});

reportsAdmin.put("/:id", async (c) => {
  const admin = c.get("user") as any;
  if (!admin) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  if (!body.status || !["resolved", "dismissed"].includes(body.status)) {
    return c.json({ error: "Status must be 'resolved' or 'dismissed'" }, 400);
  }

  try {
    const existing = await db.query.report.findFirst({
      where: eq(report.id, c.req.param("id")),
    });
    if (!existing) return c.json({ error: "Report not found" }, 404);

    await db
      .update(report)
      .set({
        status: body.status,
        resolvedAt: new Date(),
        resolvedBy: admin.id,
      })
      .where(eq(report.id, c.req.param("id")));

    return c.json({ message: `Report ${body.status}` });
  } catch (error) {
    console.error("Error updating report:", error);
    return c.json({ error: "Failed to update report" }, 500);
  }
});

export default reportsAdmin;
