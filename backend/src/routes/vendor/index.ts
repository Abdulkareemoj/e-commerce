import { Hono } from "hono";

import messagingRoutes from "./messaging";
import orderRoutes from "./order";
import productRoutes from "./product";
import profileRoutes from "./profile";

const vendorRoutes = new Hono();

vendorRoutes.route("/messaging", messagingRoutes);
vendorRoutes.route("/orders", orderRoutes);
vendorRoutes.route("/products", productRoutes);
vendorRoutes.route("/profile", profileRoutes);
export default vendorRoutes;
