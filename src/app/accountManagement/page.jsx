"use client";
import React, { useRef, useState, useEffect, useContext } from "react";
import { session, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserByEmailRole, getUserByUserId } from "../api/auth/user/route";
import { uploadFile } from "../api/auth/upload/route";
import { updateUser } from "../api/auth/user/route";
import styles from "./page.module.css";
import { UserContext } from "@/context/UserContext";
import { RadioButton } from "primereact/radiobutton";

const AccountManagement = () => {
  const session = useSession();
  const router = useRouter();
  const [refreshData, setRefreshData] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    email: "",
    fullName: "",
    profilePictureUrl: "",
    notificationMode: "",
    contactNo: "",
    status: "",
  });

  // this is to do a reload of userContext if it is updated in someway
  const { userData, fetchUserData } = useContext(UserContext);

  let roleRef, sessionTokenRef, userIdRef;

  if (session && session.data && session.data.user) {
    userIdRef = session.data.user.userId;
    roleRef = session.data.user.role;
    sessionTokenRef = session.data.user.accessToken;
  }

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/login");
    } else if (session.status !== "loading") {
      getUserByUserId(userIdRef, roleRef, sessionTokenRef)
        .then((user) => setFormData(user.data))
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    }
  }, [session.status, userIdRef, roleRef, refreshData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await uploadFile(file, sessionTokenRef);
      setFormData((prevState) => ({
        ...prevState,
        profilePictureUrl: response.url,
      }));
    } catch (error) {
      console.error("There was an error uploading the file", error);
    }
  };

  const saveChanges = async (e) => {
    e.preventDefault();
    const userId = formData.userId;
    const email = formData.email;
    const userName = formData.userName;
    const fullName = formData.fullName;
    const contactNo = formData.contactNo;
    const profilePictureUrl = formData.profilePictureUrl;
    const notificationMode = formData.notificationMode;
    const status = formData.status;
    const updateUserDetails = {
      role: roleRef,
      email: email,
      userName: userName,
      fullName: fullName,
      contactNo: contactNo,
      profilePictureUrl: profilePictureUrl,
      notificationMode: notificationMode,
      status: status,
    };
    try {
      const response = await updateUser(
        updateUserDetails,
        userId,
        sessionTokenRef
      );
      console.log("Status changed successfully:", response);
      alert("Status changed successfully!");

      setRefreshData((prev) => !prev);
      // this is to do a reload of userContext if it is updated so that navbar can change
      fetchUserData();
    } catch {
      console.log("Failed to update user");
      alert("Failed to update user particulars");
    }
  };

  if (session.status === "authenticated") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Account Details</h1>
        <form className={styles.form} onSubmit={saveChanges}>
          <div className={styles.avatarContainer}>
            {formData?.profilePictureUrl && (
              <img
                src={formData.profilePictureUrl}
                alt="User Profile"
                className={styles.avatar}
              />
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="userId">User ID:</label>
            <input
              type="text"
              id="userId"
              name="userId"
              className={styles.input}
              value={formData.userId}
              onChange={handleInputChange}
              readOnly // User ID typically shouldn't be editable
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="userName">User Name:</label>
            <input
              type="text"
              id="userName"
              name="userName"
              className={styles.input}
              value={formData.userName}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className={styles.input}
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="contactNo">Contact Number:</label>
            <input
              type="number"
              id="contactNo"
              name="contactNo"
              className={styles.input}
              value={formData.contactNo}
              onChange={handleInputChange}
            />
          </div>

          {/* This is just to check the image link */}
          {/* <div className={styles.field}>
            <label htmlFor="profilePictureUrl">Profile Picture URL:</label>
            <input
              type="url"
              id="profilePictureUrl"
              name="profilePictureUrl"
              className={styles.input}
              value={formData.profilePictureUrl}
              onChange={handleInputChange}
            />
          </div> */}

          <div className={styles.field}>
            <label htmlFor="profilePicture">Upload Profile Picture:</label>
            <input
              type="file"
              id="profilePicture"
              onChange={handleFileChange}
            />
          </div>

          <div className={styles.radio}>
            <div className={styles.notification}>
              <div className={styles.radioHeader}>Notification:</div>
              <div className={styles.radioOption}>
                <RadioButton
                  inputId="Email"
                  name="notificationMode"
                  value="Email"
                  onChange={handleInputChange}
                  checked={formData.notificationMode === "Email"}
                />
                <label htmlFor="Email" className="ml-2">
                  Email
                </label>
                <br />
                <RadioButton
                  inputId="Sms"
                  name="notificationMode"
                  value="Sms"
                  onChange={handleInputChange}
                  checked={formData.notificationMode === "Sms"}
                />
                <label htmlFor="Sms" className="ml-2">
                  Sms
                </label>
                {/* <label>
                <input
                  type="radio"
                  name="notificationMode"
                  value="Email"
                  checked={formData.notificationMode === "Email"}
                  onChange={handleInputChange}
                />
                Email
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="notificationMode"
                  value="Sms"
                  checked={formData.notificationMode === "Sms"}
                  onChange={handleInputChange}
                />
                Sms
              </label> */}
              </div>
            </div>
            <div className={styles.status}>
              <div className={styles.radioHeader}>Status:</div>
              <div className={styles.radioOption}>
                <RadioButton
                  inputId="Active"
                  name="status"
                  value="Active"
                  onChange={handleInputChange}
                  checked={formData.status === "Active"}
                />
                <label htmlFor="Active" className="ml-2">
                  Active
                </label>
                <br />
                <RadioButton
                  inputId="Inactive"
                  name="status"
                  value="Inactive"
                  onChange={handleInputChange}
                  checked={formData.status === "Inactive"}
                />
                <label htmlFor="Inactive" className="ml-2">
                  Inactive
                </label>
                {/* <label>
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formData.status === "Active"}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={formData.status === "Inactive"}
                    onChange={handleInputChange}
                  />
                  Inactive
                </label> */}
              </div>
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.button}>Save Changes</button>
          </div>
        </form>
      </div>
    );
  }
};

export default AccountManagement;
