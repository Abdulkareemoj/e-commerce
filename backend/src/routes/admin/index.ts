import { Hono } from "hono";

import platformRoutes from "./platform";
import usersRoutes from "./users";
import vendorsRoutes from "./vendors";

const vendorRoutes = new Hono();

vendorRoutes.route("/platform", platformRoutes);
vendorRoutes.route("/users", usersRoutes);
vendorRoutes.route("/vendor", vendorsRoutes);

export default vendorRoutes;
