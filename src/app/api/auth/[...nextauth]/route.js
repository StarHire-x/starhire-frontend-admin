import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { notFound } from "next/navigation";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        email: "email",
        password: "password",
        role: "role",
      },
      async authorize(credentials) {
        const { email, password, role } = credentials;
        const res = await fetch(
          `http://localhost:8080/users?email=${email}&role=${role}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );
        if (!res.ok) {
          return notFound();
        }
        const responseBody = await res.json();
        const isPasswordCorrect = await bcrypt.compare(
          password,
          responseBody.password
        );
        if (isPasswordCorrect) {
          return {
            userId: responseBody.userId,
            name: responseBody.userName,
            email: responseBody.email,
            role: responseBody.role,

          };
        } else {
          throw new Error("Wrong Credentials!");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, session }) {
      console.log("jwt callback", { token, user, session });
      if (user) {
        token.userId = user.userId;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("session callback", { session, token, user });
      session.user = {
        ...session.user,
        userId: token.userId,
        name: token.name,
        email: token.email,
        role: token.role,
      };
      return session;
    },
  }, 
  session: {
    strategy: "jwt"
  },
  pages: {
    error: "/login",
  },

});

export { handler as GET, handler as POST };
