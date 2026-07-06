import { Context, Next } from "hono";
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  report: ["view", "resolve"],
  category: ["create", "update", "delete"],
} as const;

const accessControl = createAccessControl(statement);

export const vendorRole = accessControl.newRole({
  user: ["ban"], // Can ban but not delete users
  session: ["list", "revoke"],
});

export const adminRole = accessControl.newRole({
  ...adminAc.statements,

  category: ["create", "update", "delete"],
  user: ["create", "list", "set-role", "ban", "delete"], // Full control
  session: ["list", "revoke", "delete"],
});

export { accessControl, userAc };

import { auth } from "./auth";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

/**
 * Hono middleware to restrict access based on the user's role string in the database.
 * NOTE: This is a simpler check based on the 'role' column, which should be consistent with better-auth's role assignment.
 */
export function checkRole(role: string) {
  return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          error: "Session expired. Please log in again.",
          code: "SESSION_EXPIRED",
        },
        401,
      );
    }

    if (user.role !== role) {
      return c.json(
        {
          error: `You don't have permission to access this resource.`,
          code: "FORBIDDEN",
        },
        403,
      );
    }

    await next();
  };
}

/**
 * Optional auth middleware — attaches user/session if present but never blocks.
 * Use for routes that behave differently for guests vs authenticated users.
 */
export function optionalAuth() {
  return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
    await next();
  };
}
