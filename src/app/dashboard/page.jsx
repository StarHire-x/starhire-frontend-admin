"use client";
import React from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import UserStatisticsModal from "@/components/UserStatisticsModal/UserStatisticsModal";
import JobStatisticsModal from "@/components/JobStatisticsModal/JobStatisticsModal";


const Dashboard = () => {
  const session = useSession();

  const router = useRouter();

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const role =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.role;

  if (session.status === "loading") {
    return <ProgressSpinner />;
  }

  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  if (session.status === "authenticated") {
    return (
      <>
        <div>
          <h2 className={styles.header}>
            Welcome Back {session.data.user.name}!
          </h2>
          {role === "Administrator" && (
            <>
              <UserStatisticsModal accessToken={accessToken} />
              <JobStatisticsModal accessToken={accessToken} />
            </>
          )}
        </div>
      </>
    );
  }
};

export default Dashboard;
