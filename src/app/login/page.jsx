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
import Enums from "@/common/enums/enums";

const Login = () => {
  const session = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    setErrorMessage("");
    setLoading(false);
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
        setLoading(true);
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          role,
        });
        if (!result.error) {
          // User signed in successfully
          setLoading(false);
          router.push("/dashboard");
        } else {
          // Handle the error result.error
          console.error(`Login error: ${result.error}`);
          setLoading(false);
          setErrorMessage(result.error);
        }
      } catch (error) {
        console.error("An error occurred during authentication:", error);
        setLoading(false);
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
            inputId={Enums.ADMIN}
            name="role"
            value={Enums.ADMIN}
            onChange={handleInputChange}
            checked={formData.role === Enums.ADMIN}
          />
          <label htmlFor={Enums.ADMIN} className="ml-2">
            Administrator
          </label>
          <br />
          <RadioButton
            inputId={Enums.RECRUITER}
            name="role"
            value={Enums.RECRUITER}
            onChange={handleInputChange}
            checked={formData.role === Enums.RECRUITER}
          />
          <label htmlFor={Enums.RECRUITER} className="ml-2">
            Recruiter
          </label>
        </div>
        {loading && (
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        )}
        {!loading && <button className={styles.button}>Login</button>}
      </form>
      <Link href="/register">I don&apos;t have an account </Link>
      <Link href="/forgetPassword">Forget Password</Link>
    </div>
  );
};

export default Login;
