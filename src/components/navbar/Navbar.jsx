"use client";
import Link from "next/link";
import React from "react";
import styles from "./Navbar.module.css";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getUserByUserId } from "@/app/api/auth/user/route";

const adminLinks = [
  {
    id: 2,
    title: "Job Listings",
    url: "/jobListings",
  },
  {
    id: 3,
    title: "User Management",
    url: "/userManagement",
  },
  {
    id: 4,
    title: "Account Management",
    url: "/accountManagement",
  },
  {
    id: 5,
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    id: 6,
    title: "Events",
    url: "/events",
  },
  {
    id: 7,
    title: "Forum",
    url: "/forum",
  },
];

const recruiterLinks = [
  {
    id: 2,
    title: "Account Management",
    url: "/accountManagement",
  },
  {
    id: 3,
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    id: 4,
    title: "Chat",
    url: "",
    submenu: [
      {
        id: 1,
        title: "New Chat",
        url: "/create-chat",
      },
      {
        id: 2,
        title: "Manage Chats",
        url: "/chat",
      },
    ],
  },
];

const Navbar = () => {
  const session = useSession();
  const [showDropdown, setShowDropdown] = useState(null);

  const [imageUrl, setImageUrl] = useState(null);
  const [userName, setUserName] = useState(null);
  let roleRef, sessionTokenRef, userIdRef;

  if (session && session.data && session.data.user) {
    userIdRef = session.data.user.userId;
    roleRef = session.data.user.role;
    sessionTokenRef = session.data.user.accessToken;
  }

  useEffect(() => {
    if (session.status === "authenticated") {
      const fetchData = () => {
        getUserByUserId(userIdRef, roleRef, sessionTokenRef)
          .then((user) => {
            setImageUrl(user.data.profilePictureUrl);
            setUserName(user.data.userName);
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
          });
      };

      fetchData(); // Fetch immediately

      const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [session.status, userIdRef, roleRef, sessionTokenRef]);

  const handleLinkMouseEnter = (linkId) => {
    setShowDropdown(linkId);
  };

  const handleLinkMouseLeave = () => {
    setShowDropdown(null);
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.logo}>
        StarHire
      </Link>

      <div className={styles.links}>
        <DarkModeToggle />
        {session.status === "authenticated" &&
          session.data.user.role === "Administrator" &&
          adminLinks.map((link) => (
            <div
              key={link.id}
              className={styles.linkContainer}
              onMouseEnter={() => handleLinkMouseEnter(link.id)}
              onMouseLeave={handleLinkMouseLeave}
            >
              <Link href={link.url} className={styles.link}>
                {link.title}
              </Link>
              {link.submenu && showDropdown === link.id && (
                <div className={styles.dropdown}>
                  {link.submenu.map((submenuItem) => (
                    <Link
                      key={submenuItem.id}
                      href={submenuItem.url}
                      className={styles.submenuItem}
                    >
                      {submenuItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        {session.status === "authenticated" &&
          session.data.user.role === "Recruiter" &&
          recruiterLinks.map((link) => (
            <div
              key={link.id}
              className={styles.linkContainer}
              onMouseEnter={() => handleLinkMouseEnter(link.id)}
              onMouseLeave={handleLinkMouseLeave}
            >
              <Link href={link.url} className={styles.link}>
                {link.title}
              </Link>
              {link.submenu && showDropdown === link.id && (
                <div className={styles.dropdown}>
                  {link.submenu.map((submenuItem) => (
                    <Link
                      key={submenuItem.id}
                      href={submenuItem.url}
                      className={styles.submenuItem}
                    >
                      {submenuItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        {session.status === "authenticated" && (
          <>
            <div className={styles.imageContainer}>
              <img
                src={imageUrl}
                alt="User Profile"
                className={styles.avatar}
              />
              <h6>{userName}</h6>
            </div>
            <button className={styles.logout} onClick={signOut}>
              Logout
            </button>
          </>
        )}
        {session.status === "unauthenticated" && (
          <button
            className={styles.login}
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
