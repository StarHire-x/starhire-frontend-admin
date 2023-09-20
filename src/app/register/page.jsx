"use client";
import React from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hashing } from "@/app/api/auth/register/route";
import { registerUser } from "@/app/api/auth/register/route";

const Step1 = ({ formData, setFormData, onNext }) => {
  const handleNext = () => {
    onNext();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className={styles.container}>
      <h2>Step 1: User Information</h2>
      <form className={styles.form}>
        <div className={styles.userRole}>
          <div>
            <p>I am registering as a...</p>
          </div>

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
        </div>

        <div className={styles.inputFields}>
          <input
            type="text"
            name="userName"
            placeholder="Username"
            className={styles.input}
            value={formData.userName}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={styles.input}
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </form>
      <button className={styles.button} onClick={handleNext}>Next</button>
    </div>
  );
};

const Step2 = ({ formData, setFormData, onNext, onPrevious }) => {
  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className={styles.container}>
      <h2>Step 2: Password</h2>
      <form className={styles.form}>
        <div className={styles.inputFields}>
        <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.input}
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            className={styles.input}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
      </form>
      <div className={styles.stepTwoThreeButton}>
        <button className={styles.button} onClick={handlePrevious}>Previous</button>
        <div className={styles.spacer}></div>
        <button className={styles.button} onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

const Step3 = ({ formData, setFormData, onPrevious, onSubmit, err }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform final validation and registration logic here
    onSubmit(e);
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className={styles.container}>
      <h2>Step 3: Additional Information</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputFields}>
        <input
            type="text"
            name="contactNumber"
            placeholder="Contact Number"
            className={styles.input}
            value={formData.contactNumber}
            onChange={handleInputChange}
          />
        </div>
        {err && "Something went wrong!"}
        <div className={styles.stepTwoThreeButton}>
          <button className={styles.button} onClick={handlePrevious}>Previous</button>
          <div className={styles.spacer}></div>
          <button className={styles.button}>Register</button>
        </div>
      </form>
    </div>
  );
};

const Register = () => {
  const router = useRouter();

  const [err, setErr] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    role: "",
  });

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    const v1 = formData.password;
    const v2 = formData.confirmPassword;
    if (v1 !== v2) {
      // Display a validation message near the password fields
      setErr(true);
      return; // Exit early if passwords don't match
    }

    if (
      !formData.userName ||
      !formData.email ||
      !formData.contactNumber ||
      !formData.role
    ) {
      alert(
        "Please ensure you have filled all the fields, especially your role."
      );
      return;
    }

    const data = {
      userName: formData.userName,
      email: formData.email,
      password: formData.password,
      contactNo: formData.contactNumber,
      role: formData.role,
    };

    try {
      await registerUser(data);
      alert("Account has been created!");
      router.push("/login?success=Account has been created");
    } catch (error) {
      alert(error);
      setErr(true);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Registration</h1>
      {currentStep === 1 && (
        <Step1
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
        />
      )}
      {currentStep === 2 && (
        <Step2
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
      {currentStep === 3 && (
        <Step3
          formData={formData}
          setFormData={setFormData}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          err = {err}
        />
      )}
      <Link href="/login">Login with an existing account</Link>
      <Link href="/forgetPassword">Forget Password</Link>
    </div>
  );
};

export default Register;
