import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with:", credentials?.email);
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          console.log("Missing email or password");
          return null;
        }

        // Hardcode demo user for Vercel deployment stability
        if (email === "demo@apex.ca" && password === "ApexSecure2025!") {
          console.log("Demo user matched");
          return {
            id: "demo-user-id",
            email: "demo@apex.ca",
            name: "Demo User",
          };
        }

        console.log("Checking database for user...");
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            console.log("User not found in DB");
            return null;
          }

          const ok = await bcrypt.compare(password, user.password);
          if (!ok) {
            console.log("Password mismatch");
            return null;
          }

          console.log("User authenticated successfully");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Database error during auth:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
