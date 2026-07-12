import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/../../.env.local` });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as authSchema from "./schema/auth-schema";
import * as profileSchema from "./schema/profile-schema";
import * as vendorSchema from "./schema/vendor-schema";
import * as productSchema from "./schema/product-schema";
import * as productVariantSchema from "./schema/product-variant-schema";
import * as orderSchema from "./schema/order-schema";
import * as cartSchema from "./schema/cart-schema";
import * as categorySchema from "./schema/category-schema";
import * as addressSchema from "./schema/address-schema";
import * as reviewSchema from "./schema/review-schema";
import * as couponSchema from "./schema/coupon-schema";
import * as wishlistSchema from "./schema/wishlist-schema";
import * as messageSchema from "./schema/message-schema";
import * as payoutSchema from "./schema/payout-schema";
import * as reportSchema from "./schema/report-schema";
import * as notificationSchema from "./schema/notification-schema";

export const schema = {
  ...authSchema,
  ...profileSchema,
  ...vendorSchema,
  ...productSchema,
  ...productVariantSchema,
  ...orderSchema,
  ...cartSchema,
  ...categorySchema,
  ...addressSchema,
  ...reviewSchema,
  ...couponSchema,
  ...wishlistSchema,
  ...messageSchema,
  ...payoutSchema,
  ...reportSchema,
  ...notificationSchema,
};
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle({ client: queryClient, schema });
