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
          `http://localhost:8080/users/login?email=${email}&role=${role}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "An error occurred");
        }
        const responseBody = await res.json();
        const isPasswordCorrect = await bcrypt.compare(
          password,
          responseBody.data.password
        );

        if (isPasswordCorrect) {
          return {
            userId: responseBody.data.userId,
            name: responseBody.data.userName,
            email: responseBody.data.email,
            role: responseBody.data.role,
            status: responseBody.data.status,
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
        token.status = user.status;
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
        status: token.status,
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
