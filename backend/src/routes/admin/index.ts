import { Hono } from "hono";
import { checkRole } from "@/utils/permissions"; 

import dashboardRoutes from "./dashboard";
import platformRoutes from "./platform";
import usersRoutes from "./users";
import vendorsRoutes from "./vendors";
import productsRoutes from "./products";
import ordersRoutes from "./orders";
import payoutsRoutes from "./payouts";
import categoriesRoutes from "./categories";
import couponAdminRoutes from "./coupons";
import profileAdminRoutes from "./profile";

const adminRoutes = new Hono();

adminRoutes.use("*", checkRole("admin")); 

adminRoutes.route("/dashboard", dashboardRoutes);
adminRoutes.route("/platform", platformRoutes);
adminRoutes.route("/users", usersRoutes);
adminRoutes.route("/vendor", vendorsRoutes);
adminRoutes.route("/products", productsRoutes);
adminRoutes.route("/orders", ordersRoutes);
adminRoutes.route("/payouts", payoutsRoutes);
adminRoutes.route("/categories", categoriesRoutes);
adminRoutes.route("/coupons", couponAdminRoutes);
adminRoutes.route("/profile", profileAdminRoutes);

export default adminRoutes;
