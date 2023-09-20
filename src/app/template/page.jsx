"use client"
import React from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Hero from "../../../public/hero.png";

const Template = () => {

  const handleDelete = async () => {};
  
  const handleSubmit = async (e) => {};

  return (
    <div className={styles.container}>
      <div className={styles.posts}>
        <div className={styles.post}>
          <div className={styles.imgContainer}>
            <Image src={Hero} alt="Picture" width={200} height={100} />
          </div>
          <h2 className={styles.postTitle}>Placeholder</h2>
          <span className={styles.delete} onClick={() => handleDelete()}>
          </span>
        </div>
      </div>
      <form className={styles.new} onSubmit={handleSubmit}>
        <h1>Add New Job Listing</h1>
        <input type="text" placeholder="Title" className={styles.input} />
        <input type="text" placeholder="Desc" className={styles.input} />
        <input type="text" placeholder="Image" className={styles.input} />
        <textarea
          placeholder="Content"
          className={styles.textArea}
          cols="30"
          rows="10"
        ></textarea>
        <button className={styles.button}>Send</button>
      </form>
    </div>
  );
};

export default Template;
