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
import { Button } from "primereact/button";
import { assignJobListing } from "../api/jobListings/route";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import Enums from "@/common/enums/enums";
import { Toast } from "primereact/toast";

export default function UserProfile() {
  const session = useSession();

  const router = useRouter();

  const toast = useRef(null);

  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [assignDialog, setAssignDialog] = useState(false);

  const userIdRef =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.userId;

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserRole =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.role;

  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const params = useSearchParams();
  const selectedUserId = params.get("userId");
  const selectedUserRole = params.get("role");
  const selectedJobListingId = params.get("jobListingId");

  useEffect(() => {
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

  const hideAssignDialog = () => {
    setAssignDialog(false);
  };

  const recruiterAssignDialogFooter = () => (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        rounded
        outlined
        onClick={hideAssignDialog}
      />
      <Button
        label="Assign"
        rounded
        icon="pi pi-check"
        onClick={handleOnAssignClick}
      />
    </React.Fragment>
  );

  const handleOnBackClick = () => {
    // router.push(`/userManagement?jobListingId=${id}`);
    router.back();
  };

  // ====================================== Trying to assign job seekers to job listing during matching process by updating job listing ======================================
  const handleOnAssignClick = async () => {
    // This part should take in jobSeekerId, jobListingId, and pass it to backend to do the job listing assigning part.
    const jobListingId = selectedJobListingId;
    const jobSeekerId = user?.userId;
    // console.log("HERE!!!");
    // console.log(jobSeekerId);

    try {
      const response = await assignJobListing(
        jobSeekerId,
        jobListingId,
        userIdRef,
        accessToken
      );
      console.log("Job Seeker has been assigned to Job Listing", response);
      // alert('Job Seeker has been matched with Job Listing successfully');
      // setRefreshData((prev) => !prev);
      router.back(); // goes back to previous page to see list of job seekers for this job listing
    } catch (error) {
      console.error(
        "There was an error matching the job seeker to the job listing:",
        error.message
      );
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "There was an error matching the job seeker to the job listing",
        life: 5000,
      });
    }
    // setSelectedRowData();
    setAssignDialog(false);
  };

  return (
    <>
      <Toast ref={toast} />
      <div className={styles.container}>
        {isLoading ? (
          <ProgressSpinner
            style={{
              display: "flex",
              height: "100vh",
              "justify-content": "center",
              "align-items": "center",
            }}
          />
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
                <div className={styles.userInformationContainer}>
                  <div>
                    {user?.fullName && (
                      <p className={styles.userDetailsFullName}>
                        Name: {user?.fullName}
                      </p>
                    )}
                    <p className={styles.userDetails}>
                      Username: {user.userName}
                    </p>
                    <p className={styles.userDetails}>
                      Date of Birth: {formatDate(user?.dateOfBirth)}
                    </p>

                    <p className={styles.userDetails}>Email: {user.email}</p>
                    <p className={styles.userDetails}>
                      Contact Number: {user.contactNo}
                    </p>
                    {user?.resumePdf && currentUserRole === Enums.RECRUITER && (
                      <Button
                        size="small"
                        label="View Resume"
                        icon="pi pi-file-pdf"
                        onClick={() => {
                          window.open(user?.resumePdf, "_blank");
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.userInformationSecondRow}>
                    {/* display information here in new row */}
                  </div>
                </div>
              </Card>
            </div>
            <div className={styles.jobPreferenceSection}>
              <JobPreferencePanel jobPreference={user?.jobPreference} />
            </div>
            <div className={styles.jobExperienceSection}>
              <JobExperiencePanel jobExperience={user?.jobExperiences} />
            </div>
            <div className={styles.footerButtonsContainer}>
              <div className={styles.backButtonContainer}>
                <Button
                  label="Back"
                  icon="pi pi-chevron-left"
                  rounded
                  className={styles.backButton}
                  onClick={() => handleOnBackClick()}
                />
              </div>
              {currentUserRole && currentUserRole === Enums.RECRUITER && (
                <div className={styles.assignButtonContainer}>
                  <Button
                    label="Assign"
                    rounded
                    className={styles.assignButton}
                    onClick={() => setAssignDialog(true)}
                  />
                  <Dialog
                    visible={assignDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Assign Job Listing"
                    className="p-fluid"
                    footer={recruiterAssignDialogFooter}
                    onHide={hideAssignDialog}
                  >
                    <h3>
                      Do you wish to assign Job Listing {selectedJobListingId}{" "}
                      to {user && user?.userName}?
                    </h3>
                  </Dialog>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
