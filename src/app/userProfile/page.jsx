"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserByUserId } from "../api/auth/user/route";
import HumanIcon from "../../../public/icon.png";
import styles from "./page.module.css";
import { Card } from "primereact/card";
import JobExperiencePanel from "@/components/JobExperiencePanel/JobExperiencePanel";
import JobPreferencePanel from "@/components/JobPreferencePanel/JobPreferencePanel";

export default function UserProfile() {
  const session = useSession();

  const router = useRouter();

  const [user, setUser] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const userIdRef =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.userId;

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const params = useSearchParams();
  const selectedUserId = params.get("userId");
  const selectedUserRole = params.get("role");

  useEffect(() => {
    console.log(`selected userId: ${selectedUserId}`);
    console.log(`selected user role: ${selectedUserRole}`);

    // call API to retrieve selected user data
    if (accessToken) {
      getUserByUserId(selectedUserId, selectedUserRole, accessToken)
        .then((response) => {
          setUser(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(`Error fetching user: ${error}`);
          setIsLoading(false);
        });
    }
  }, [selectedUserId, selectedUserRole, accessToken]);

  useEffect(() => {
    console.log(`User data: ${JSON.stringify(user)}`);
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.loadingAnimation}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <>
          <div className={styles.userProfileSection}>
            <div className={styles.userProfilePictureContainer}>
              {user.profilePictureUrl === "" ? (
                <Image src={HumanIcon} alt="User" className={styles.avatar} />
              ) : (
                <img
                  src={user.profilePictureUrl}
                  alt="User"
                  className={styles.avatar}
                />
              )}
            </div>

            <Card className={styles.userDetailsCard}>
              <p className={styles.userDetailsFullName}>
                Name: {user?.fullName}
              </p>
              <p className={styles.userDetails}>
                Date of Birth: {formatDate(user?.dateOfBirth)}
              </p>
              <p className={styles.userDetails}>Username: {user.userName}</p>
              <p className={styles.userDetails}>Email: {user.email}</p>
              <p className={styles.userDetails}>
                Contact Number: {user.contactNo}
              </p>
            </Card>
          </div>
          <div className={styles.jobPreferenceSection}>
            <JobPreferencePanel jobPreference={user?.jobPreference} />
          </div>
          <div className={styles.jobExperienceSection}>
            <JobExperiencePanel jobExperience={user?.jobExperiences} />
          </div>
        </>
      )}
    </div>
  );
}
