import { Hono } from "hono";
import adminRoutes from "./admin";
import userRoutes from "./user";
import vendorRoutes from "./vendor";
import productPublicRoutes from "./product"; 

const api = new Hono();

api.route("/admin", adminRoutes);
api.route("/user", userRoutes); 
api.route("/vendor", vendorRoutes);
api.route("/products", productPublicRoutes);

export default api;
