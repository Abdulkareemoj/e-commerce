import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  emailOTPClient,
  oneTapClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:5173",
  plugins: [
    adminClient(),
    oneTapClient({
      clientId: Deno.env.get("GOOGLE_CLIENT_ID"),
      promptOptions: {
        maxAttempts: 1,
      },
    }),
    emailOTPClient(),
    usernameClient(),
  ],
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  getSession,
  forgetPassword,
  resetPassword,
  isUsernameAvailable,
  sendVerificationEmail,
  requestPasswordReset,
} = authClient;
