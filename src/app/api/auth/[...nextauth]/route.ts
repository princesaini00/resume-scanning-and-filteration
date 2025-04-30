// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/database";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";

// Define the MongoDB user structure
interface DBUser {
  _id: any;
  email: string;
  password: string;
  role?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isAdmin: { label: "Is Admin", type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          await connectDB();
          const usersCollection = mongoose.connection.collection("users");

          // Check if this is an admin login attempt
          if (credentials.isAdmin === "true") {
            const adminCollection = mongoose.connection.collection("admins");
            const admin = await adminCollection.findOne({ username: credentials.email });
            
            if (!admin) return null;

            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              admin.password
            );

            if (!isPasswordCorrect) return null;

            return {
              id: admin._id.toString(),
              email: admin.username,
              role: "admin"
            };
          }

          // Regular user login
          const user = await usersCollection.findOne({ email: credentials.email });

          if (!user) return null;

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || "user"
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role || "user"; // Add role to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string; // Add role to session
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For social login we'll create the user if they don't exist
      if (account?.provider === "google") {
        try {
          await connectDB();
          const usersCollection = mongoose.connection.collection("users");
          
          const existingUser = await usersCollection.findOne({ email: user.email });
          
          if (!existingUser && user.email) {
            // Create a new user with a random password since they're using social login
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            await usersCollection.insertOne({
              email: user.email,
              password: hashedPassword,
              role: "user",
              createdAt: new Date()
            });
          }
          
          return true;
        } catch (error) {
          console.error("Social login error:", error);
          return false;
        }
      }
      
      return true;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };