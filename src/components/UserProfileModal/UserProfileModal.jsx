import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./UserProfile.module.css";
import { Card } from "primereact/card";
import JobExperiencePanel from "@/components/JobExperiencePanel/JobExperiencePanel";
import JobPreferencePanel from "@/components/JobPreferencePanel/JobPreferencePanel";
import { Button } from "primereact/button";
import Enums from "@/common/enums/enums";

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const UserProfileModal = ({ selectedUser, currentUserRole }) => {

  return (
    <div className={styles.container}>
      <>
        <div className={styles.userProfileSection}>
          <div className={styles.userProfilePictureContainer}>
            {selectedUser.profilePictureUrl === "" ? (
              <Image src={HumanIcon} alt="User" className={styles.avatar} />
            ) : (
              <img
                src={selectedUser.profilePictureUrl}
                alt="User"
                className={styles.avatar}
              />
            )}
          </div>

          <Card className={styles.userDetailsCard}>
            <div className={styles.userInformationContainer}>
              <div>
                {selectedUser?.fullName && (
                  <p className={styles.userDetailsFullName}>
                    Name: {selectedUser?.fullName}
                  </p>
                )}
                <p className={styles.userDetails}>
                  Username: {selectedUser.userName}
                </p>
                <p className={styles.userDetails}>
                  Date of Birth: {formatDate(selectedUser?.dateOfBirth)}
                </p>

                <p className={styles.userDetails}>
                  Email: {selectedUser.email}
                </p>
                <p className={styles.userDetails}>
                  Contact Number: {selectedUser.contactNo}
                </p>
                {selectedUser?.resumePdf &&
                  currentUserRole === Enums.RECRUITER && (
                    <Button
                      size="small"
                      label="View Resume"
                      icon="pi pi-file-pdf"
                      onClick={() => {
                        window.open(selectedUser?.resumePdf, "_blank");
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
          <JobPreferencePanel jobPreference={selectedUser?.jobPreference} />
        </div>
        <div className={styles.jobExperienceSection}>
          <JobExperiencePanel jobExperience={selectedUser?.jobExperiences} />
        </div>
        {/* <div className={styles.footerButtonsContainer}>
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
                  Do you wish to assign Job Listing {selectedJobListingId} to{" "}
                  {selectedUser && selectedUser?.userName}?
                </h3>
            </div>
          )}
        </div> */}
        {/* </Dialog> */}
      </>
    </div>
  );
};

export default UserProfileModal;
