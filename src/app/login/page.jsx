"use client"
import React from 'react'
import styles from './page.module.css'
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import Link from "next/link";
import bcrypt from "bcryptjs";
import { headers } from '../../../next.config';

const Login = () => {

  const session = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if(session.status === "loading") {
    return <p>Loading ....</p>
  }

  if(session.status === "authenticated") {
    router?.push("/dashboard");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = formData.email;
    const password = formData.password;
    const role = formData.role;
    alert(`Email: ${email}, Password: ${password}, Role: ${role}`);

    try {
      const result = await signIn('credentials', {
        email: email,
        password: password,
        role: role 
      })
    } catch (err) {
      console.error("Sign-in error:", error);
      alert(err);
    }
    // try {
    //   // Fetch the user from the database by email and role
    //   const res = await fetch(
    //     `http://localhost:8080/users?email=${email}&role=${role}`,
    //     {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );

    //   if (res.status === 200) {
    //     const userData = await res.json();
    //     const hashedPasswordFromDB = userData.password; // Replace 'password' with the actual field name in your database
    //     // Compare the entered password with the hashed password from the database
    //     const passwordsMatch = await bcrypt.compare(
    //       password,
    //       hashedPasswordFromDB
    //     );

    //     if (passwordsMatch) {
    //       // Passwords match, you can save the user's state here
    //       alert("Password is correct. User state can be saved.");
    //     } else {
    //       alert("Incorrect password");
    //     }
    //   } else if (res.status === 404) {
    //     alert("User not found");
    //   } else {
    //     alert("Error fetching user");
    //   }
    // } catch (err) {
    //   console.error("Fetch error:", err);
    //   alert(err);
    // }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className={styles.input}
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className={styles.input}
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <div className={styles.radio}>
          <label>
            <input
              type="radio"
              name="role"
              value="Administrator"
              checked={formData.role === "Administrator"}
              onChange={handleInputChange}
            />
            Job Seeker
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="Recruiter"
              checked={formData.role === "Recruiter"}
              onChange={handleInputChange}
            />
            Recruiter
          </label>
        </div>
        <button className={styles.button}>Login</button>
      </form>
      <Link href="/register">I don't have an account </Link>
      <button onClick={() => signIn("google")}>Login with Google</button>
    </div>
  );
}

export default Login;