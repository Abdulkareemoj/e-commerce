import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth-schema";
import * as profileSchema from "./schema/profile-schema";
import * as vendorSchema from "./schema/vendor-schema";
import * as productSchema from "./schema/product-schema";

export const schema = {
  ...authSchema,
  ...profileSchema,
  ...vendorSchema,
  ...productSchema,
};
export const db = drizzle(process.env.DATABASE_URL!, { schema });
