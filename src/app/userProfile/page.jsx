"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserByUserId } from "../api/auth/user/route";
import HumanIcon from "../../../public/icon.png";
import styles from "./page.module.css";

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

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.loadingAnimation}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <div>
          {user.profilePictureUrl === "" ? (
            <Image src={HumanIcon} alt="User" className={styles.avatar} />
          ) : (
            <img
              src={user.profilePictureUrl}
              alt="User"
              className={styles.avatar}
            />
          )}

          {/* {user.profilePictureUrl !== "" ? (
            <img
              src={user?.profilePictureUrl}
              alt="User Profile"
              className={styles.avatar}
            />
          ) : (
            <Image src={HumanIcon} alt= "User icon"/>
          )} */}
        </div>
      )}
    </div>
  );
}
