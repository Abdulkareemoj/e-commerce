import { Hono } from "hono";
import profileRoutes from "./profile";
import cartRoutes from "./cart";
import messagingRoutes from "./messaging";
import ordersRoutes from "./orders";
import productRoutes from "./products";

const userRoutes = new Hono();

userRoutes.route("/profile", profileRoutes);
userRoutes.route("/cart", cartRoutes);
userRoutes.route("/messaging", messagingRoutes);
userRoutes.route("/orders", ordersRoutes);
userRoutes.route("/product", productRoutes);

export default userRoutes;
