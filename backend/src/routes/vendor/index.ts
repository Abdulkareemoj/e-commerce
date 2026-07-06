import { Hono } from "hono";
import { checkRole } from "@/utils/permissions";
import { db } from "@/db";
import { vendor } from "@/db/schema/vendor-schema";
import { eq } from "drizzle-orm";
import productsVendor from "./products";
import variantsVendor from "./variants";
import ordersVendor from "./orders";
import payoutsVendor from "./payouts";
import storeVendor from "./store";
import messagingVendor from "./messaging";
import profileVendor from "./profile";
import inventoryVendor from "./inventory";
import dashboardVendor from "./dashboard";

const vendorRoutes = new Hono();

// Status check — registered before role check so both users and vendors can poll for approval
vendorRoutes.get("/status", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      {
        error: "Session expired. Please log in again.",
        code: "SESSION_EXPIRED",
      },
      401,
    );
  }

  try {
    const existing = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });

    return c.json({
      status: existing?.isVerified ?? null,
      vendor: existing || null,
    });
  } catch (error) {
    console.error("Failed to check vendor status:", error);
    return c.json({ error: "Failed to check vendor status" }, 500);
  }
});

vendorRoutes.use("*", checkRole("vendor"));

vendorRoutes.route("/products", productsVendor);
vendorRoutes.route("/variants", variantsVendor);
vendorRoutes.route("/orders", ordersVendor);
vendorRoutes.route("/payouts", payoutsVendor);
vendorRoutes.route("/store", storeVendor);
vendorRoutes.route("/messaging", messagingVendor);
vendorRoutes.route("/profile", profileVendor);
vendorRoutes.route("/inventory", inventoryVendor);
vendorRoutes.route("/dashboard", dashboardVendor);

export default vendorRoutes;
