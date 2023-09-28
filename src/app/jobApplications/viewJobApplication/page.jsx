"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { viewJobApplicationDetails } from "@/app/api/auth/jobApplications/route";
import { Card } from "primereact/card";
import styles from "./page.module.css";
import Image from "next/image";
import HumanIcon from "../../../../public/icon.png";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";
import { Tree } from "primereact/tree";
import { Dropdown } from "@/components/Dropdown/Dropdown";

const viewJobApplication = () => {
  const session = useSession();
  const router = useRouter();

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const params = useSearchParams();
  const jobApplicationId = params.get("id");

  const [isLoading, setIsLoading] = useState(false);
  const [jobSeeker, setJobSeeker] = useState(null);
  const [jobApplication, setJobApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [jobListing, setJobListing] = useState(null);

  const convertTimestampToDate = (timestamp) => {
    let currentDate = new Date(timestamp);
    return (
      currentDate.getDate() +
      "/" +
      currentDate.getMonth() +
      "/" +
      currentDate.getFullYear()
    );
  };

  const getSeverity = (status) => {
    switch (status) {
      case "Rejected":
        return "danger";

      case "Accepted":
        return "success";

      case "Submitted":
        return "info";

      case "Processing":
        return "warning";

      case "Waiting_For_Interview":
        return null;
    }
  };

  const getApplicationStatus = () => {
    const severity = getSeverity(jobApplication?.jobApplicationStatus);
    return (
      <Tag severity={severity} value={jobApplication?.jobApplicationStatus} />
    );
  };

  const handleOnBackClick = () => {
    return router.push(
      `/jobApplications?id=${jobApplication?.jobApplicationId}`
    );
  };

  const nodes = [
    {
      key: "0",
      label: "Basic Details",
      children: [
        { key: "0-0", label: `Title: ${jobListing?.title}` },
        { key: "0-1", label: `Overview: ${jobListing?.overview}` },
      ],
    },
    {
      key: "1",
      label: "Requirements",
      children: [
        {
          key: "1-0",
          label: `Responsibilities: ${jobListing?.responsibilities}`,
        },
        { key: "1-1", label: `Requirements: ${jobListing?.requirements}` },
        {
          key: "1-2",
          label: `Required Documents: ${jobListing?.requiredDocuments}`,
        },
      ],
    },
  ];

  // retrieve all jobApplication and jobSeeker details
  useEffect(() => {
    const populateDetails = async () => {
      try {
        const details = await viewJobApplicationDetails(
          jobApplicationId,
          accessToken
        );
        console.log(details);
        setJobApplication(details);
        setJobSeeker(details.jobSeeker);
        setDocuments(details.documents);
        setJobListing(details.jobListing);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    setIsLoading(true);
    populateDetails();
  }, [jobApplicationId, accessToken]);

  return (
    <>
      {isLoading && (
        <div className="card flex justify-content-center">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        </div>
      )}
      {!isLoading && (
        <div className={styles.container}>
          <div className={styles.jobSeekerDetails}>
            {jobSeeker && jobSeeker.profilePictureUrl != "" ? (
              <img
                src={jobSeeker.profilePictureUrl}
                alt="user"
                className={styles.avatar}
              />
            ) : (
              <Image
                src={HumanIcon}
                alt="Profile Picture"
                className={styles.avatar}
              />
            )}
            <Card className={styles.jobSeekerCard} title="Applicant Details">
              <p className={styles.text}>
                <b>Username: </b>
                {jobSeeker?.userName}
              </p>
              {jobSeeker?.fullName && (
                <p className={styles.text}>
                  <b>Full Name: </b>
                  {jobSeeker.fullName}
                </p>
              )}
              <p className={styles.text}>
                <b>Contact Number: </b>
                {jobSeeker?.contactNo}
              </p>
              <p className={styles.text}>
                <b>Email: </b>
                {jobSeeker?.email}
              </p>
            </Card>
          </div>
          <div className={styles.jobSeekerApplication}>
            <Card className={styles.childCard} title="Job Listing Details">
              <Dropdown nodes={nodes} />
            </Card>
            <Card
              className={styles.childCard}
              title="Application Details"
              subTitle={getApplicationStatus}
            >
              <div className={styles.dates}>
                <p>
                  <b>Available Start Date:</b>
                  <br />
                  {convertTimestampToDate(jobApplication?.availableStartDate)}
                </p>
                <p>
                  <b>Available End Date:</b>
                  <br />
                  {convertTimestampToDate(jobApplication?.availableEndDate)}
                </p>
              </div>
            </Card>
          </div>
          <div className={styles.buttons}>
            <Button
              label="Back"
              icon="pi pi-chevron-left"
              rounded
              severity="primary"
              onClick={() => handleOnBackClick()}
            />
            <Button
              label="Send Corporate"
              icon="pi pi-send"
              rounded
              severity="info"
              // onClick={() => handleOnAssignClick()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default viewJobApplication;
