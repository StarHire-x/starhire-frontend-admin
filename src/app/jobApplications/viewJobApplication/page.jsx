"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { viewJobApplicationDetails } from "@/app/api/jobApplications/route";
import { Card } from "primereact/card";
import styles from "./page.module.css";
import Image from "next/image";
import HumanIcon from "../../../../public/icon.png";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { Checkbox } from "primereact/checkbox";
import { DialogBox } from "@/components/DialogBox/DialogBox";
import { updateJobApplicationStatus } from "@/app/api/jobApplications/route";
import moment from "moment";
import {
  createNewChatByRecruiter,
  getAllUserChats,
} from "@/app/api/chat/route";

const ViewJobApplication = () => {
  const session = useSession();
  const router = useRouter();
  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const currentUserId = session.data && session.data.user?.userId;

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
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openSendCorporateDialog, setOpenSendCorporateDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  const convertTimestampToDate = (timestamp) => {
    return moment(timestamp).format("DD/MM/YYYY");
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

      case "To_Be_Submitted":
        return "null";

      case "Waiting_For_Interview":
        return "null";
    }
  };

  const getApplicationStatus = () => {
    const severity = getSeverity(jobApplication?.jobApplicationStatus);
    return (
      <Tag
        severity={severity}
        value={jobApplication?.jobApplicationStatus?.replaceAll("_", " ")}
      />
    );
  };

  const getCardHeader = () => {
    return (
      <div className={styles.cardHeader}>
        <h2>User Details</h2>
        <div>
          <Button
            outlined
            rounded
            size="small"
            icon="pi pi-comments"
            onClick={handleChatClick}
          />
        </div>
      </div>
    );
  };

  const handleChatClick = async () => {
    // Check if chat exists already
    try {
      const jobSeekerChats = await getAllUserChats(
        jobSeeker?.userId,
        accessToken
      );
      const matchingChats = jobSeekerChats.filter(
        (chat) => chat?.recruiter?.userId === currentUserId
      );
      console.log(jobSeekerChats, matchingChats);
      let chatId = null;
      if (matchingChats.length === 0) {
        const request = {
          recruiterId: currentUserId,
          jobSeekerId: jobSeeker?.userId,
          lastUpdated: new Date(),
        };
        const response = await createNewChatByRecruiter(request, accessToken);
        chatId = response?.chatId;
      } else {
        chatId = matchingChats[0]?.chatId;
      }
      router.push(`/chat?id=${chatId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnBackClick = () => {
    router.back();
  };

  const updateStatus = async (status) => {
    const request = {
      jobApplicationStatus: status,
    };
    try {
      await updateJobApplicationStatus(
        request,
        jobApplication?.jobApplicationId,
        accessToken
      );
    } catch (error) {
      console.log(error);
    }
    handleCloseDialog();
    setIsLoading(true);
    await populateDetails();

    // router.push(`/jobApplications?id=${jobListing?.jobListingId}`);
  };

  const nodes = [
    {
      key: "0",
      label: "Basic Details",
      children: [
        { key: "0-0", label: `Title: ${jobListing?.title || "none"}` },
        { key: "0-1", label: `Overview: ${jobListing?.overview || "--"}` },
        { key: "0-2", label: `Location: ${jobListing?.jobLocation || "--"}` },
        {
          key: "0-3",
          label: `Job Start Date: ${
            convertTimestampToDate(jobListing?.jobStartDate) || "--"
          }`,
        },
      ],
    },
    {
      key: "1",
      label: "Qualifications & Requirements",
      children: [
        {
          key: "1-0",
          label: `Responsibilities: ${jobListing?.responsibilities || "--"}`,
        },
        {
          key: "1-1",
          label: `Requirements: ${jobListing?.requirements || "--"}`,
        },
        {
          key: "1-2",
          label: `Required Documents: ${jobListing?.requiredDocuments || "--"}`,
        },
      ],
    },
  ];

  const onDocumentChange = (e) => {
    let _selectedDocuments = [...selectedDocuments];

    if (e.checked) _selectedDocuments.push(e.value);
    else
      _selectedDocuments = _selectedDocuments.filter(
        (document) => document.documentId !== e.value.documentId
      );

    setSelectedDocuments(_selectedDocuments);
  };

  const handleClickReject = () => {
    setOpenRejectDialog(true);
  };

  const handleClickSendCorporate = () => {
    setOpenSendCorporateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenRejectDialog(false);
    setOpenSendCorporateDialog(false);
  };

  const footerButtons = () => {
    return (
      <div className="flex-container space-between">
        <Button
          label="No"
          icon="pi pi-times"
          outlined
          onClick={handleCloseDialog}
          className="p-button-text"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          onClick={async () => {
            setDialogLoading(true);
            try {
              await updateStatus(
                openRejectDialog ? "To_Be_Submitted" : "Processing"
              );
            } catch (error) {
              console.log(error);
            }

            handleCloseDialog;
            setDialogLoading(false);
          }}
          loading={dialogLoading}
          autoFocus
        />
      </div>
    );
  };

  const populateDetails = async () => {
    try {
      const details = await viewJobApplicationDetails(
        jobApplicationId,
        accessToken
      );
      setJobApplication(details);
      setJobSeeker(details.jobSeeker);
      setDocuments(details.documents);
      setJobListing(details.jobListing);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  // retrieve all jobApplication and jobSeeker details
  useEffect(() => {
    setIsLoading(true);
    populateDetails();
  }, [jobApplicationId, accessToken]);

  return (
    <>
      <DialogBox
        header={
          openRejectDialog
            ? `Reject Application`
            : openSendCorporateDialog
            ? `Accept Application`
            : ``
        }
        content={
          openRejectDialog
            ? `Reject ${jobSeeker?.userName}'s application?`
            : openSendCorporateDialog
            ? `Send ${jobSeeker?.userName}'s application to corporate?`
            : ``
        }
        footerContent={footerButtons}
        isOpen={openRejectDialog || openSendCorporateDialog}
        setVisible={
          openRejectDialog ? setOpenRejectDialog : setOpenSendCorporateDialog
        }
      />
      {isLoading && (
        <div className="card flex justify-content-center">
          <ProgressSpinner
            style={{
              display: "flex",
              height: "100vh",
              "justify-content": "center",
              "align-items": "center",
            }}
          />
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
            <Card header={getCardHeader} className={styles.jobSeekerCard}>
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
            <Card className={styles.childCard} title="Job Listing">
              <Dropdown nodes={nodes} />
            </Card>
            <Card
              className={styles.childCard}
              title="Application"
              subTitle={getApplicationStatus}
            >
              <div className={styles.dates}>
                <p>
                  <b>Submission Date:</b>{" "}
                  {convertTimestampToDate(jobApplication?.submissionDate)}
                </p>
                <p>
                  <b>Available Dates:</b>{" "}
                  {convertTimestampToDate(jobApplication?.availableStartDate)}{" "}
                  to {convertTimestampToDate(jobApplication?.availableEndDate)}
                </p>
              </div>
              <div className={styles.checkboxes}>
                <p>
                  {" "}
                  <b>Documents Submitted:</b>
                </p>
                {documents.map((document) => (
                  <div
                    key={document.documentId}
                    className={styles.childCheckbox}
                  >
                    {jobApplication?.jobApplicationStatus === "Submitted" && (
                      <Checkbox
                        inputId={document.documentId}
                        name="document"
                        value={document}
                        onChange={onDocumentChange}
                        checked={selectedDocuments.some(
                          (item) => item.documentId === document.documentId
                        )}
                      />
                    )}
                    <label htmlFor={document.documentId} className="ml-2">
                      {document.documentName}
                    </label>
                    <a href={`${document.documentLink}`} target="_blank">
                      <Button
                        icon="pi pi-download"
                        rounded
                        text
                        severity="info"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className={styles.buttons}>
            <Button
              label="Back"
              className={styles.backButton}
              icon="pi pi-chevron-left"
              rounded
              severity="primary"
              onClick={() => handleOnBackClick()}
            />
            {jobApplication?.jobApplicationStatus === "Submitted" && (
              <div className={styles.subButtons}>
                <Button
                  label="Reject"
                  icon="pi pi-thumbs-down"
                  rounded
                  severity="danger"
                  onClick={handleClickReject}
                />
                <Button
                  label="Send Corporate"
                  icon="pi pi-send"
                  rounded
                  severity="info"
                  disabled={selectedDocuments.length != documents.length}
                  onClick={handleClickSendCorporate}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ViewJobApplication;
