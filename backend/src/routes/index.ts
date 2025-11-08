import { Hono } from "hono";
import adminRoutes from "./admin"; // Assuming admin/index.ts exports a Hono app
import userRoutes from "./user"; // Assuming user/index.ts exports a Hono app
import vendorRoutes from "./vendor"; // Assuming vendor/index.ts exports a Hono app

const api = new Hono();

api.route("/admin", adminRoutes);
api.route("/user", userRoutes);
api.route("/vendor", vendorRoutes);

export default api;
