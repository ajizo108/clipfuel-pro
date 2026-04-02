import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google"; // ✅ ADD THIS
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
    // ✅ GOOGLE LOGIN (THIS FIXES YOUR ERROR)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ✅ KEEP EMAIL LOGIN
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
    async jwt({ token, user }) {
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