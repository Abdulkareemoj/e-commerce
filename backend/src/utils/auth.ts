import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, oneTap, username } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";

import {
  resetConfirmTemplate,
  resetTemplate,
  verificationTemplate,
} from "@utils/mail";

import { profile } from "@db/schema/profile-schema";
import { accessControl, adminRole, vendorRole, userAc } from "./permissions";
import { db, schema } from "@/db";
// import { organization } from "better-auth/plugins/organization";
// const resend = new Resend(RESEND_API_KEY);
const from = process.env.BETTER_AUTH_EMAIL

export const auth = betterAuth({
  appName: "Foreum",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "moderator"], // Both can access admin routes
      accessControl,
      roles: {
        admin: adminRole,
        vendor: vendorRole,
        user: userAc,
      },
    }),
    username({
      minUsernameLength: 5,
      maxUsernameLength: 25,
      usernameValidator: (username) => /^[a-z0-9_-]+$/.test(username),
      usernameNormalization: (username) => {
        return username
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9_-]/g, "");
      },
      displayUsernameNormalization: (display) => display.trim(),
    }),
    // organization(),
    //     {
    //   async sendInvitationEmail(data) {
    //     await resend.emails.send({
    //       from,
    //       to: data.email,
    //       subject: "You've been invited to join an organization",
    //       react: reactInvitationEmail({
    //         username: data.email,
    //         invitedByUsername: data.inviter.user.name,
    //         invitedByEmail: data.inviter.user.email,
    //         teamName: data.organization.name,
    //         inviteLink:
    //           process.env.NODE_ENV === "development"
    //             ? `http://localhost:3000/accept-invitation/${data.id}`
    //             : `${
    //                 process.env.BETTER_AUTH_URL ||
    //                 "https://demo.better-auth.com"
    //               }/accept-invitation/${data.id}`,
    //       });
    //     });
    //   },
    // }
    oneTap(),
    // emailOTP(),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await db.insert(profile).values({
              id: user.id,
              bio: "",
              location: "",
              website: "",
            });
            console.log(`✅ Profile created for user ${user.id}`);
          } catch (err) {
            console.error("❌ Failed to create profile:", err);
          }
        },
      },
    },
  },
  // emailVerification: {
  //   async sendVerificationEmail({ user, url, token }, request) {
  //     const emailContent = verificationTemplate
  //       .replace("{{username}}", user.name || user.email)
  //       .replace(/{{url}}/g, url);

  //     const res = await resend.emails.send({
  //       from,
  //       to: user.email,
  //       subject: "Verify your email address",
  //       html: emailContent,
  //     });
  //     console.log(res, user.email);
  //   },
  //   sendOnSignUp: true,
  //   autoSignInAfterVerification: true,
  //   expiresIn: 3600, // 1 hour
  // },
  // emailAndPassword: {
  //   enabled: true,
  //   async sendResetPassword({ user, url, token }, request) {
  //     const emailContent = resetTemplate
  //       .replace("{{username}}", user.name || user.email)
  //       .replace(/{{url}}/g, url);

  //     const res = await resend.emails.send({
  //       from,
  //       to: user.email,
  //       subject: "Reset your password",
  //       html: emailContent,
  //     });
  //     console.log(res, `Password reset link sent to ${user.email}.`);
  //   },
  //   async onPasswordReset({ user }, request) {
  //     const emailContent = resetConfirmTemplate.replace(
  //       "{{username}}",
  //       user.name || user.email
  //     );

  //     const res = await resend.emails.send({
  //       from,
  //       to: user.email,
  //       subject: "Password Reset Confirmation",
  //       html: emailContent,
  //     });
  //     console.log(res, `Password reset confirmation sent to ${user.email}.`);
  //   },
  //   requireEmailVerification: true,
  // },
  account: {
    accountLinking: {
      trustedProviders: ["google", "discord", "foreum"],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    },
  },
});
