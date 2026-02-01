import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, oneTap, username } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { expo } from "@better-auth/expo";

import { profile } from "@db/schema/profile-schema";
import { accessControl, adminRole, vendorRole, userAc } from "./permissions";
import { db, schema } from "@/db";
// import { organization } from "better-auth/plugins/organization";
// const resend = new Resend(RESEND_API_KEY);
const from = process.env.BETTER_AUTH_EMAIL;

export const auth = betterAuth({
  appName: "ecommerce",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [
    "http://localhost:8081",
    "mobile://",
    ...(process.env.NODE_ENV !== "production"
      ? [
          "exp://",
          "exp://**",
          "exp://*/*",
          "exp://10.0.0.*:*/*",
          "exp://192.168.*.*:*/*",
          "exp://172.*.*.*:*/*",
          "exp://localhost:*/*",
        ]
      : []),
  ],
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
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
    expo(),

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
  emailAndPassword: {
    enabled: true,
  },
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
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    },
  },
});
