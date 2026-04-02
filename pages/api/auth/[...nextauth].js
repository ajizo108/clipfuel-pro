import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

export default NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    EmailProvider({
      server: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // 🔥 ALWAYS SYNC WITH DATABASE
    async jwt({ token, user }) {
      // Prefer token.email but fall back to user.email on first sign-in
      const email = token?.email || user?.email;

      if (!email) return token;

      const dbUser = await prisma.user.findUnique({ where: { email } });

      if (dbUser) {
        token.isPro = dbUser.isPro;
        token.email = dbUser.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      // Always read latest user state from DB to ensure session is accurate
      const email = token?.email;

      if (!email) {
        session.user.isPro = !!token.isPro;
        return session;
      }

      const dbUser = await prisma.user.findUnique({ where: { email } });

      session.user.isPro = !!(dbUser && dbUser.isPro);
      return session;
    },
  },

  debug: true,
});