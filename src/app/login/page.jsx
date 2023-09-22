"use client";
import React from "react";
import styles from "./page.module.css";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { headers } from "../../../next.config";
import bcrypt from "bcryptjs";
import { hashing } from "../api/auth/register/route";
import { ProgressSpinner } from "primereact/progressspinner";
import { RadioButton } from "primereact/radiobutton";

const Login = () => {
  const session = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (session.status === "loading") {
    return <ProgressSpinner />;
  }

  if (session.status === "authenticated") {
    router?.push("/dashboard");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, role } = formData;

    if (!email) {
      setErrorMessage("Please fill in your email!");
      return;
    } else if (!password) {
      setErrorMessage("Please fill in your password!");
      return;
    } else if (!role) {
      setErrorMessage("Please fill in your role!");
      return;
    } else {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          role,
        });
        if (!result.error) {
          // User signed in successfully
          router.push("/dashboard");
        } else {
          // Handle the error result.error
          console.error(`Login error: ${result.error}`);
          setErrorMessage(result.error);
        }
      } catch (error) {
        console.error("An error occurred during authentication:", error);
        setErrorMessage(error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
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
          <p>Role:</p>
          <RadioButton
            inputId="Administrator"
            name="role"
            value="Administrator"
            onChange={handleInputChange}
            checked={formData.role === "Administrator"}
          />
          <label htmlFor="Administrator" className="ml-2">
            Administrator
          </label>
          <br />
          <RadioButton
            inputId="Recruiter"
            name="role"
            value="Recruiter"
            onChange={handleInputChange}
            checked={formData.role === "Recruiter"}
          />
          <label htmlFor="Recruiter" className="ml-2">
            Recruiter
          </label>
          {/* <label>
            <input
              type="radio"
              name="role"
              value="Administrator"
              checked={formData.role === "Administrator"}
              onChange={handleInputChange}
            />
            Administrator
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
          </label> */}
        </div>
        <button className={styles.button}>Login</button>
      </form>
      <Link href="/register">I don't have an account </Link>
      <Link href="/forgetPassword">Forget Password</Link>
    </div>
  );
};

export default Login;
