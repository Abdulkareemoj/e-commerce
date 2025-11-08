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
