"use client";
import Image from 'next/image'
import styles from './page.module.css'
import Hero from 'public/hero.png'
import Button from '@/components/Button/Button'

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <h1 className={styles.title}>StarHire Administrator Portal</h1>
        <p className={styles.desc}>Explore our services and manage your operations with ease.</p>
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
      </div>
      <div className={styles.item}></div>
      <Image src={Hero} alt="AltPhoto" className={styles.img}/>
    </div>
  )
}