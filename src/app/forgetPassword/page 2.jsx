"use client"
import React from 'react'
import styles from './page.module.css'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { forgetPassword } from '../api/auth/forgetPassword/route';

const ForgetPassword = () => {

    const session = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
      email: "",
      role: "",
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };

    if (session.status === "authenticated") {
      router?.push("/dashboard");
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      const email = formData.email;
      const role = formData.role;
      alert(`Email: ${email}, Role: ${role}`);

      try {
        const result = await forgetPassword(email,role);

        alert(result.message);
        router.push("/resetPassword");
      } catch (error) {
        alert(error);
      }
    };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Forget Password</h1>
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
        <div className={styles.radio}>
          <label>
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
          </label>
        </div>
        <button className={styles.button}>Reset Password</button>
      </form>
      <Link href="/register">I don't have an account </Link>
      <Link href="/login">Login with an existing account</Link>
    </div>
  );
}

export default ForgetPassword