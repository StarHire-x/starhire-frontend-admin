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
          `http://localhost:8080/users/login?email=${email}&password=${password}&role=${role}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const responseBody = await res.json();

        if (responseBody.statusCode === 404) {
          throw new Error(responseBody.message || "An error occurred");
        }

        // const isPasswordCorrect = await bcrypt.compare(
        //   password,
        //   responseBody.data.password
        // );

        // if (isPasswordCorrect) {
        //   return {
        //     userId: responseBody.data.userId,
        //     name: responseBody.data.userName,
        //     email: responseBody.data.email,
        //     role: responseBody.data.role,
        //     status: responseBody.data.status,
        //   };
        // } else {
        //   throw new Error("Wrong Credentials!");
        // }

        return {
          userId: responseBody.data.userId,
          name: responseBody.data.userName,
          email: responseBody.data.email,
          role: responseBody.data.role,
          status: responseBody.data.status,
          image: responseBody.data.profilePictureUrl,
          jwtAccessToken: responseBody.jwtAccessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      console.log("jwt callback", { token, user });
      if (user) {
        token.userId = user.userId;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.status = user.status;
        token.image = user.image;
        token.accessToken = user.jwtAccessToken;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("session callback", { session, token });
      session.user = {
        ...session.user,
        userId: token.userId,
        name: token.name,
        email: token.email,
        role: token.role,
        status: token.status,
        image: token.image,
        accessToken: token.accessToken
      };
      return session;
    },
    // async jwt({ token, user, session }) {
    //   // backend should return user object with access token field
    //   // then we store the access token in "token" variable here
    //   console.log("jwt callback", { token, user, session });
    //   if (user) {
    //     token.userId = user.userId;
    //     token.name = user.name;
    //     token.email = user.email;
    //     token.role = user.role;
    //     token.status = user.status;
    //     token.accessToken = user.jwtAccessToken;
    //   }
    //   return token;
    // },
    // async session({ session, token, user }) {
    //   console.log("session callback", { session, token, user });
    //   session.user = {
    //     ...session.user,
    //     userId: token.userId,
    //     name: token.name,
    //     email: token.email,
    //     role: token.role,
    //     status: token.status,
    //   };
    //   session.accessToken = token.accessToken;
    //   return session;
    // },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/login",
  },
});

export { handler as GET, handler as POST };
