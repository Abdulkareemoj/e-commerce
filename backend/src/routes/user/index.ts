import { Hono } from "hono";
import { checkRole } from "@/utils/permissions"; 
import profileUser from "./profile";
import cartUser from "./cart";
import messagingUser from "./messaging";
import ordersUser from "./orders";
import productUser from "./products";

const userRoutes = new Hono();

userRoutes.use("*", checkRole("user")); 

userRoutes.route("/profile", profileUser);
userRoutes.route("/cart", cartUser);
userRoutes.route("/messaging", messagingUser);
userRoutes.route("/orders", ordersUser);
userRoutes.route("/product", productUser);

export default userRoutes;
