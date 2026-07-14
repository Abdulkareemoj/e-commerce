import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { initUpload } from "@/utils/storage";

const uploadRoutes = new Hono();

// All upload routes require authentication (any role)
uploadRoutes.use("*", async (c, next) => {
  const user = (c as any).get("user");
  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }
  await next();
});

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

uploadRoutes.post("/init", zValidator("json", initSchema), async (c) => {
  try {
    const { fileName, contentType, fileSize, purpose } = c.req.valid("json");

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
