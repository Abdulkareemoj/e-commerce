import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as authSchema from "./schema/auth-schema";
import * as profileSchema from "./schema/profile-schema";
import * as vendorSchema from "./schema/vendor-schema";
import * as productSchema from "./schema/product-schema";
import * as orderSchema from "./schema/order-schema";
import * as categorySchema from "./schema/category-schema";
import * as addressSchema from "./schema/address-schema";

export const schema = {
  ...authSchema,
  ...profileSchema,
  ...vendorSchema,
  ...productSchema,
  ...orderSchema,
  ...categorySchema,
  ...addressSchema,
};
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle({ client: queryClient }, { schema });
