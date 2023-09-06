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
    // CredentialsProvider({
    //   id: "credentials",
    //   name: "Credentials",
    //   async authorize(credentials) {
    //     console.log(credentials.email);
    //     try {
    //       const res = await fetch(
    //         `http://localhost:8080/users/?email=${credentials.email}`,
    //         {
    //           cache: "no-store",
    //         }
    //       );

    //       if (!res.ok) {
    //         return notFound();
    //       }

    //       const responseBody = await res.json(); // Read the response body once

    //       const isPasswordCorrect = await bcrypt.compare(
    //         credentials.password,
    //         responseBody.password
    //       );

    //       if (isPasswordCorrect) {
    //         return responseBody;
    //       } else {
    //         throw new Error("Wrong Credentials!");
    //       }
    //     } catch (err) {
    //       throw new Error(err);
    //     }
    //   },
    // }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "radio" },
      },
      authorize: async (credentials) => {
        try {
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
          if (res.status === 200) {
            const userData = await res.json();
            const hashedPasswordFromDB = userData.password; // Replace 'password' with the actual field name in your database
            const passwordsMatch = await bcrypt.compare(
              password,
              hashedPasswordFromDB
            );

            if (passwordsMatch) {
              // If the passwords match, return the user object
              return Promise.resolve({
                id: userData.userId,
                name: userData.userName,
                email: userData.email,
                role: userData.role,
              });
            } else {
              throw new Error("Wrong Credentials!"); // Authentication failed
            }
          } else if (res.status === 404) {
            return notFound(); // User not found
          } else {
            return notFound(); // Error fetching user
          }
        } catch (err) {
          throw new Error(err);
        }
      },
    }),
  ],
  pages: {
    error: "/login",
  },
});

export { handler as GET, handler as POST };
