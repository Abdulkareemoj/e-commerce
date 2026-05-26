import { Hono } from "hono";
import adminRoutes from "./admin";
import userRoutes from "./user";
import vendorRoutes from "./vendor";
import cartRoutes from "./cart";
import productPublicRoutes from "./product";
import couponPublicRoutes from "./coupon";

const api = new Hono();

api.route("/admin", adminRoutes);
api.route("/user", userRoutes); 
api.route("/vendor", vendorRoutes);
api.route("/cart", cartRoutes);
api.route("/products", productPublicRoutes);
api.route("/coupons", couponPublicRoutes);

export default api;
