import { Hono } from "hono";
import { checkRole } from "@/utils/permissions"; 
import profileUser from "./profile";
import cartUser from "./cart";
import messagingUser from "./messaging";
import ordersUser from "./orders";
import productUser from "./products";
import reviewUser from "./reviews";
import wishlistUser from "./wishlist";
import becomeVendorUser from "./become-vendor";
import vendorStatusUser from "./vendor-status";
import onboardingUser from "./onboarding";
import addressesUser from "./addresses";

const userRoutes = new Hono();

userRoutes.use("*", checkRole("user")); 

userRoutes.route("/profile", profileUser);
userRoutes.route("/cart", cartUser);
userRoutes.route("/messaging", messagingUser);
userRoutes.route("/orders", ordersUser);
userRoutes.route("/product", productUser);
userRoutes.route("/reviews", reviewUser);
userRoutes.route("/wishlist", wishlistUser);
userRoutes.route("/become-vendor", becomeVendorUser);
userRoutes.route("/vendor-status", vendorStatusUser);
userRoutes.route("/", onboardingUser);
userRoutes.route("/addresses", addressesUser);

export default userRoutes;
