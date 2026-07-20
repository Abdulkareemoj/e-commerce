import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { initUpload } from "@/utils/storage";
import { db } from "@/db";
import { vendor } from "@/db/schema/vendor-schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/utils/rate-limiter";

const uploadRoutes = new Hono();

uploadRoutes.use("*", async (c, next) => {
  const user = (c as any).get("user");
  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }
  await next();
});

uploadRoutes.use("*", rateLimit({ windowMs: 60_000, max: 15 }));

const initSchema = z.object({
  fileName: z.string().min(1, "fileName is required").max(255),
  contentType: z.string().min(1, "contentType is required"),
  fileSize: z
    .number()
    .positive("fileSize must be positive")
    .max(50 * 1024 * 1024),
  purpose: z
    .enum(["product", "variant", "avatar", "message", "general"])
    .default("general"),
});

// purposes that write into a vendor's own catalog — restricted below.
// avatar/message/general stay open to any authenticated user.
const VENDOR_ONLY_PURPOSES = new Set(["product", "variant"]);

uploadRoutes.post("/init", zValidator("json", initSchema), async (c) => {
  try {
    const user = (c as any).get("user");
    const { fileName, contentType, fileSize, purpose } = c.req.valid("json");

    if (VENDOR_ONLY_PURPOSES.has(purpose)) {
      // Admins bypass the vendor-approval check; they're not applicants.
      if (user.role === "admin") {
        // allowed
      } else if (user.role !== "vendor") {
        return c.json(
          { error: `Only vendors can request uploads for purpose "${purpose}"` },
          403,
        );
      } else {
        const v = await db.query.vendor.findFirst({
          where: eq(vendor.userId, user.id),
          columns: { isVerified: true },
        });
        if (v?.isVerified !== "approved") {
          return c.json(
            { error: "Your vendor account must be approved before uploading catalog media" },
            403,
          );
        }
      }
    }

    const result = await initUpload(fileName, contentType, fileSize, purpose);

    return c.json(result);
  } catch (error: any) {
    console.error("Upload init failed:", error);
    return c.json(
      { error: error.message || "Failed to initialize upload" },
      400,
    );
  }
});

export default uploadRoutes;