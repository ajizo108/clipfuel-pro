import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token }) {
      // simple pro flag (you can upgrade later)
      token.isPro = token.isPro || false;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.isPro = token.isPro || false;
      }
      return session;
    },
  },

  debug: true,
});