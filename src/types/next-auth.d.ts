// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extends the built-in session with a role property
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in user with a role property
   */
  interface User {
    id: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT with a role property
   */
  interface JWT {
    id: string;
    role?: string;
  }
}