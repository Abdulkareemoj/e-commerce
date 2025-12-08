import { Hono } from "hono";
import { checkRole } from "@/utils/permissions"; 

import platformRoutes from "./platform";
import usersRoutes from "./users";
import vendorsRoutes from "./vendors";

const adminRoutes = new Hono();

adminRoutes.use("*", checkRole("admin")); 

adminRoutes.route("/platform", platformRoutes);
adminRoutes.route("/users", usersRoutes);
adminRoutes.route("/vendor", vendorsRoutes);

export default adminRoutes;
