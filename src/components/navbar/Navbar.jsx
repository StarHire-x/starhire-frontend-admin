"use client";
import Link from "next/link";
import React from "react";
import styles from "./Navbar.module.css";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const links = [
  {
    id: 1,
    title: "Home",
    url: "/",
  },
  {
    id: 2,
    title: "About",
    url: "/about",
  },
  {
    id: 3,
    title: "User Management",
    url: "/userManagement",
  },
  {
    id: 4,
    title: "Contact",
    url: "/contact",
  },
  {
    id: 5,
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    id: 6,
    title: "Chat",
    url: "/chat",
    submenu: [
      {
        id: 1,
        title: "New Chat",
        url: "/",
      },
      {
        id: 2,
        title: "View Chat",
        url: "/",
      },
    ],
  },
];

const adminLinks = [
  {
    id: 1,
    title: "User Management",
    url: "/userManagement"
  },
]

const Navbar = () => {
  const session = useSession();  
  const [showDropdown, setShowDropdown] = useState(null);

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
        {links.map((link) => (
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
          <button className={styles.logout} onClick={signOut}>
            Logout
          </button>
        )}
        {session.status === "unauthenticated" && (
          <button className={styles.login} onClick={() => window.location.href = "/login"}>
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
