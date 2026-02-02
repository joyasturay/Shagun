import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/db/lib/prisma";
import { verifyCredentials } from "./auth-service";
import type { AuthUser } from "./auth-types";
import { isAuthUser } from "./type-guards";
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        return await verifyCredentials(credentials);
      },
    }),
  ],
  callbacks: {
  async jwt({ token, user, trigger }) {
    if (trigger === "signIn" && isAuthUser(user)) {
      token.id = user.id;
    }
    return token;
  },

  async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true } 
        })

        session.user.role = freshUser?.role || "COLLECTOR"
      }
      return session
    }
  },

  pages: {
    signIn: "/login",
  },
});
