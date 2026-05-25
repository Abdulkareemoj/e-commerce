import { Hono } from "hono";
import { checkRole } from "@/utils/permissions";
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
