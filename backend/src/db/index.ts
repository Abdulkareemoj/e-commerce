import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth-schema';
import * as profileSchema from './schema/profile-schema';
export const schema = {
	...authSchema,
	...profileSchema,
	
};
export const db = drizzle(process.env.DATABASE_URL!, { schema });
