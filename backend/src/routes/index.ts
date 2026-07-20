import { Hono } from "hono";
import adminRoutes from "./admin";
import userRoutes from "./user";
import vendorRoutes from "./vendor";
import cartRoutes from "./cart";
import productPublicRoutes from "./product";
import couponPublicRoutes from "./coupon";
import uploadRoutes from "./upload";
import { rateLimit } from "@/utils/rate-limiter";

const api = new Hono();

api.use("*", rateLimit({ windowMs: 60_000, max: 120 }));

api.route("/admin", adminRoutes);
api.route("/user", userRoutes);
api.route("/vendor", vendorRoutes);
api.route("/cart", cartRoutes);
api.route("/products", productPublicRoutes);
api.route("/coupons", couponPublicRoutes);
api.route("/upload", uploadRoutes);

export default api;
