"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserByUserId } from "../api/auth/user/route";
import HumanIcon from "../../../public/icon.png";
import styles from "./page.module.css";
import { Card } from "primereact/card";
import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Rating } from "primereact/rating";

export default function UserProfile() {
  const session = useSession();

  const router = useRouter();

  const [user, setUser] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  // Job Preference informaton Dialog Box
  const [visible, setVisible] = useState(false);

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

  const headerTemplate = (options) => {
    const className = `${options.className}`;
    const titleClassName = `${options.titleClassName} ml-2 text-primary`;
    const style = { fontSize: "1.25rem" };

    return (
      <div className={className}>
        <span className={titleClassName} style={style}>
          Job Preferences
        </span>
        <Button
          style={{
            width: "30px",
            height: "30px",
          }}
          severity="info"
          onClick={() => setVisible(true)}
          icon="pi pi-info"
          outlined
        ></Button>
      </div>
    );
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
            <Panel headerTemplate={headerTemplate}>
              <div className={styles.dialogueContainer}>
                {/* <Button
                  style={{
                    width: "30px",
                    height: "30px",
                    marginBottom: "30px",
                  }}
                  severity="info"
                  onClick={() => setVisible(true)}
                  icon="pi pi-info"
                  outlined
                ></Button> */}
                <Dialog
                  header="What are job preferences?"
                  visible={visible}
                  style={{ width: "80vw" }}
                  onHide={() => setVisible(false)}
                >
                  <p className={styles.dialogueText}>
                    These preferences serve as indicators of your prioritization
                    criteria when evaluating potential job opportunities.
                    <br />
                    <br />
                    You will be matched to suitable opportunities based on the
                    preferences that you have provided
                    <br />
                    <br />
                    Locations:
                    <br />5 star: {"<"} 1km of mrt/bus
                    <br />4 star: {"<"} 2km of mrt/bus
                    <br />3 star: {"<"} 3km of mrt/bus
                    <br />2 star: {"<"} 5km of mrt/bus
                    <br />1 star: {"<"} 10km of mrt/bus
                    <br />
                    <br />
                    Salary:
                    <br />5 star: {">"}$10,000
                    <br />4 star: {">"}$5,000
                    <br />3 star: {">"}$3,500
                    <br />2 star: {">"}$2,500
                    <br />1 star: {">"}$1,500
                    <br />
                    <br />
                    Work Life Balance:
                    <br />5 star: {">"}50 hrs / week
                    <br />4 star: {">"}40 hrs / week
                    <br />3 star: {">"}30 hrs / week
                    <br />2 star: {">"}20 hrs / week
                    <br />1 star: {">"}10 hrs / week
                    <br />
                  </p>
                </Dialog>
              </div>
              <div className={styles.inputFields}>
                <div className={styles.fieldRating}>
                  <label
                    htmlFor="locationPreference"
                    className={styles.labelRating}
                  >
                    Location:
                  </label>
                  <Rating
                    value={Number(user?.jobPreference?.locationPreference)}
                    disabled={true}
                    stars={5}
                    cancel={false}
                  />
                </div>

                <div className={styles.fieldRating}>
                  <label
                    htmlFor="salaryPreference"
                    className={styles.labelRating}
                  >
                    Salary:
                  </label>
                  <Rating
                    value={Number(user?.jobPreference?.salaryPreference)}
                    stars={5}
                    disabled={true}
                    cancel={false}
                  />
                </div>

                <div className={styles.fieldRating}>
                  <label
                    htmlFor="workLifeBalancePreference"
                    className={styles.labelRating}
                  >
                    Work Life Balance:
                  </label>
                  <Rating
                    value={Number(
                      user?.jobPreference?.workLifeBalancePreference
                    )}
                    stars={5}
                    disabled={true}
                    cancel={false}
                  />
                </div>

                <div className={styles.fieldRating}>
                  <label
                    htmlFor="culturePreference"
                    className={styles.labelRating}
                  >
                    Culture:
                  </label>
                  <Rating
                    value={Number(user?.jobPreference?.culturePreference)}
                    stars={5}
                    disabled={true}
                    cancel={false}
                  />
                </div>

                <div className={styles.fieldRating}>
                  <label
                    htmlFor="diversityPreference"
                    className={styles.labelRating}
                  >
                    Diversity:
                  </label>
                  <Rating
                    value={Number(user?.jobPreference?.diversityPreference)}
                    stars={5}
                    disabled={true}
                    cancel={false}
                  />
                </div>
              </div>
            </Panel>
          </div>
          <div className={styles.jobExperienceSection}>
            <Panel header="Job Experience"></Panel>
          </div>
        </>
      )}
    </div>
  );
}
