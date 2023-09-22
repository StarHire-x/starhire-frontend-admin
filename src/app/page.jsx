"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Hero from "public/hero.png";
import Button from "@/components/Button/Button";
import { useSession } from "next-auth/react";

export default function Home() {
  const session = useSession();

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;
  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <h1 className={styles.title}>StarHire Administrator Portal</h1>
        <p className={styles.desc}>
          Explore our services and manage your operations with ease.
        </p>
        {!accessToken && (
          <div className={styles.buttonContainer}>
            <button
              className={styles.register}
              onClick={() => (window.location.href = "/register")}
            >
              Register
            </button>

            <button
              className={styles.login}
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
          </div>
        )}
      </div>
      <div className={styles.item}></div>
      <Image src={Hero} alt="AltPhoto" className={styles.img} />
    </div>
  );
}
