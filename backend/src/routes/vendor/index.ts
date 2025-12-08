import { Hono } from "hono";
import { checkRole } from "@/utils/permissions"; 
import productsVendor from "./products";
import ordersVendor from "./orders";
import payoutsVendor from "./payouts";
import storeVendor from "./store";
import messagingVendor from "./messaging";
import profileVendor from "./profile";

const vendorRoutes = new Hono();

vendorRoutes.use("*", checkRole("vendor"));

vendorRoutes.route("/products", productsVendor);
vendorRoutes.route("/orders", ordersVendor);
vendorRoutes.route("/payouts", payoutsVendor);
vendorRoutes.route("/store", storeVendor);
vendorRoutes.route("/messaging", messagingVendor);
vendorRoutes.route("/profile", profileVendor);

export default vendorRoutes;
