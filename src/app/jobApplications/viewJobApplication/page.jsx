"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { viewJobApplicationDetails } from "@/app/api/auth/jobApplications/route";
import { Card } from "primereact/card";
import styles from "./page.module.css";
import Image from "next/image";
import HumanIcon from "../../../../public/icon.png";

const viewJobApplication = () => {
  const session = useSession();

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const params = useSearchParams();
  const jobApplicationId = params.get("id");

  const [jobSeeker, setJobSeeker] = useState(null);
  const [jobApplication, setJobApplication] = useState(null);
  const [documents, setDocuments] = useState([]);

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
      } catch (error) {
        console.log(error);
      }
    };

    populateDetails();
  }, [jobApplicationId, accessToken]);

  return (
    <div className={styles.container}>
      <div className={styles.jobSeekerDetails}>
        <Image
          src={HumanIcon}
          alt="Profile Picture"
          className={styles.avatar}
        />
        <Card className={styles.jobSeekerCard} title="Job Seeker Details">
          <p>Job Seeker Name: {jobSeeker?.userName}</p>
        </Card>
      </div>
    </div>
  );
};

export default viewJobApplication;
