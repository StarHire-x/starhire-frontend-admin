'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from 'primereact/card';
import styles from './viewAnEvent.module.css';
import Image from 'next/image';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useRouter } from 'next/navigation';
import { Dropdown } from '@/components/Dropdown/Dropdown';
import { Checkbox } from 'primereact/checkbox';
import moment from 'moment';
import HumanIcon from '../../../../public/icon.png';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message'; 

import {
  createChat,
  createChatMessage,
  getAllUserChats,
} from '@/app/api/chat/route';

const ViewJobApplicationDetails = () => {
  const session = useSession();
  const router = useRouter();

  if (session.status === 'unauthenticated') {
    router?.push('/login');
  }

  const accessToken =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === 'authenticated' && session.data.user.userId;

  const currentUserName =
    session.status === 'authenticated' && session.data.user.name;
  console.log(session);

  const params = useSearchParams();
  const eventId = params.get('id');

  const [isLoading, setIsLoading] = useState(false);
  const [jobSeeker, setJobSeeker] = useState(null);
  const [recruiter, setRecruiter] = useState(null);
  const [jobApplication, setJobApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [jobListing, setJobListing] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [userDialog, setUserDialog] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null); 


  const [interviewDateTimes, setInterviewDateTimes] = useState([]);
  const [showArrangeInterviewDialog, setShowArrangeInterviewDialog] =
    useState(false);
  const [interviewDate, setInterviewDate] = useState(''); // State to store the interview date
  const [interviewNotes, setInterviewNotes] = useState('');
  const [confirmSendDialog, setConfirmSendDialog] = useState(false);

  const displayStatus = (status) => {
    switch (status) {
      case 'Offered':
        return 'Offered';
      case 'Rejected':
        return 'Rejected';
      case 'Rejected':
        return 'Offer Accepted';
      case 'Offer_Rejected':
        return 'Offer Rejected';
      case 'Offer_Accepted':
        return 'Offer Accepted';
      case 'Processing':
        return 'Processing';
      case 'to_be_submitted':
        return 'To Be Submitted';
      case 'Waiting_For_Interview':
        return 'Interview in Process';
      default:
        return 'Unknown';
    }
  };

  const getStatus = (status) => {
    switch (status) {
      case "to_be_submitted":
        return "info";
      case "Processing":
        return "warning";
      case "Waiting_For_Interview":
        return "info";
      case "Offer_Rejected":
        return "danger";
      case "Rejected":
        return "danger";
      case "Offer_Accepted":
        return "success";
      case "Rejected":
        return "danger";
      case "Offered":
        return "warning";
      case "Unverified":
        return "warning";
      default:
        return "";
    }
  };

  const showConfirmSendDialog = (action) => {
    setConfirmSendDialog(true);
    setStatus(action);
  };

  const hideConfirmSendDialog = () => {
    setConfirmSendDialog(false);
  };

  const renderInterviewDateTimes = () => {
    return interviewDateTimes.map((entry, index) => (
      <div key={index} className={styles.interviewDateTimeEntry}>
        <span>Date: {moment(entry.date).format('DD/MM/YYYY HH:mm')}</span>
        <Button
          label="Remove"
          icon="pi pi-trash"
          onClick={() => removeInterviewDateTime(index)}
          className="p-button-danger"
        />
      </div>
    ));
  };

  const addInterviewDateTime = () => {
    if (interviewDate) {
      const newEntry = {
        date: moment(interviewDate).format(),
      };

      setInterviewDateTimes([...interviewDateTimes, newEntry]);
      setInterviewDate(''); 
    } else {
      setError('Please select an interview date and time.'); 
    }
  };

  const handleArrangeInterview = () => {
    setError(null);
    setShowArrangeInterviewDialog(true);
  };


  const hideArrangeInterviewDialog = () => {
    setShowArrangeInterviewDialog(false);
  };

  const confirmSendDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={hideConfirmSendDialog}
      />
    </React.Fragment>
  );

  const confirmSendDialogContent = (
    <div>
      <p>Are you sure you want to send this to the recruiter?</p>
    </div>
  );

  const arrangeInterviewDialogFooter = (
    <React.Fragment>
      <Button
        label="Discard"
        icon="pi pi-times"
        outlined
        onClick={hideArrangeInterviewDialog}
      />
       <Button
        label="Send to Recruiter"
        icon="pi pi-check"
        outlined
        onClick={() => {
          if (interviewDateTimes.length === 0) {
            setError('Please add at least one interview date and time.');
          } else {
            showConfirmSendDialog('Waiting_For_Interview');
          }
        }}
      />
    </React.Fragment>
  );

  const convertTimestampToDate = (timestamp) => {
    return moment(timestamp).format('DD/MM/YYYY');
  };

  const formattedDate = (timestamp) => {
    return moment(timestamp).format('DD/MM/YYYY HH:mm');
  };

  const removeInterviewDateTime = (index) => {
    const updatedDateTimes = [...interviewDateTimes];
    updatedDateTimes.splice(index, 1);
    setInterviewDateTimes(updatedDateTimes);
  };

  const getApplicationStatus = () => {
    return (
      <Tag
        value={displayStatus(jobApplication?.jobApplicationStatus)}
        severity={getStatus(jobApplication?.jobApplicationStatus)}
      />
    );
  };

  const handleOnBackClick = () => {
    router.back();
  };

  const updateJobApplication = async (newStatus) => {
    try {
      const request = {
        jobApplicationStatus: newStatus,
      };
      const response = await updateJobApplicationStatus(
        request,
        jobApplicationId,
        accessToken
      );
      console.log('Status is ' + response.status);

      if (response.status === 200) {
        if (newStatus === "Offered" || newStatus === "Rejected") {
          //router.back();
          router.push(`/jobListingManagement/viewAllMyJobListings/viewJobApplications?id=${jobListing.jobListingId}`)
        } 
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong! ERROR CODE:' + response.statusCode,
          life: 5000,
        });
      }
      console.log('Status changed successfully:', response);
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const showUserDialog = (action) => {
    setUserDialog(true);
    setStatus(action);
  };

  const userDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button
        label="Yes"
        icon="pi pi-check"
        outlined
        onClick={() => {
          updateJobApplication(status);
        }}
      />
    </React.Fragment>
  );

  const nodes = [
    {
      key: '0',
      label: 'Basic Details',
      children: [
        { key: '0-0', label: `Title: ${jobListing?.title}` },
        { key: '0-1', label: `Overview: ${jobListing?.overview}` },
        { key: '0-2', label: `Location: ${jobListing?.jobLocation}` },
        {
          key: '0-3',
          label: `Job Start Date: ${convertTimestampToDate(
            jobListing?.jobStartDate
          )}`,
        },
      ],
    },
    {
      key: '1',
      label: 'Qualifications & Requirements',
      children: [
        {
          key: '1-0',
          label: `Responsibilities: ${jobListing?.responsibilities}`,
        },
        { key: '1-1', label: `Requirements: ${jobListing?.requirements}` },
        {
          key: '1-2',
          label: `Required Documents: ${jobListing?.requiredDocuments}`,
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

  /*
  useEffect(() => {
    if (accessToken) {
      getJobSeekersByJobApplicationId(jobApplicationId, accessToken)
        .then((details) => {
          setJobApplication(details);
          setJobSeeker(details.jobSeeker);
          setDocuments(details.documents);
          setJobListing(details.jobListing);
          setRecruiter(details.recruiter);
          setIsLoading(false);
          //console.log(jobApplication);
        })
        .catch((error) => {
          console.error('Error fetching job listings:', error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);
  */

  return (
    <>
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
            <Card className={styles.jobSeekerCard} title="Personal Particulars">
              <p className={styles.text}>
                <b>Full Name: </b>
                {jobSeeker?.fullName}
              </p>
              <p className={styles.text}>
                <b>User ID: </b>
                {jobSeeker?.userId}
              </p>
              {/* do not show contact number and email in case corporate contact job seeker themselves.
              <p className={styles.text}>
                <b>Contact Number: </b>
                {jobSeeker?.contactNo}
              </p>
              <p className={styles.text}>
                <b>Email Address: </b>
                {jobSeeker?.email}
              </p>
              */}
              <p className={styles.text}>
                <b>Date of Birth: </b>
                {convertTimestampToDate(jobSeeker?.dateOfBirth)}
              </p>
              <p className={styles.text}>
                <b>Place of Residence: </b>
                {jobSeeker?.homeAddress}
              </p>
              {jobApplication?.jobApplicationStatus === "Offer_Accepted" && (
                <>
                  <p className={styles.text}>
                    <b>Contact Number: </b>
                    <span style={{ color: "green" }}>
                      {jobSeeker?.contactNo}
                    </span>
                  </p>
                  <p className={styles.text}>
                    <b>Email Address: </b>
                    <span style={{ color: "green" }}>{jobSeeker?.email}</span>
                  </p>
                </>
              )}
            </Card>
          </div>
          <div className={styles.jobSeekerApplication}>
            <Card className={styles.childCard} title="Job Listing">
              <Dropdown nodes={nodes} />
            </Card>
            <Card
              className={styles.childCard}
              title="Application Details"
              subTitle={getApplicationStatus}
            >
              <div className={styles.dates}>
                <p>
                  <b>Available Dates</b>
                  <br />
                  {convertTimestampToDate(
                    jobApplication?.availableStartDate
                  )}{" "}
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
                    <Checkbox
                      inputId={document.documentId}
                      name="document"
                      value={document}
                      onChange={onDocumentChange}
                      checked={selectedDocuments.some(
                        (item) => item.documentId === document.documentId
                      )}
                    />
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

            {jobApplication?.jobApplicationStatus ===
              "Waiting_For_Interview" && (
              <div className={styles.subButtons}>
                <Button
                  label="Accept"
                  icon="pi pi-thumbs-up"
                  rounded
                  severity="success"
                  onClick={() => showUserDialog("Offered")}
                />
                <Button
                  label="Reject"
                  icon="pi pi-thumbs-down"
                  rounded
                  severity="danger"
                  onClick={() => showUserDialog("Rejected")}
                />

                <Dialog
                  visible={userDialog}
                  style={{ width: "32rem" }}
                  breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                  header="Are you sure? This action is not reversible!!"
                  className="p-fluid"
                  footer={userDialogFooter}
                  onHide={hideDialog}
                ></Dialog>

                <Dialog
                  visible={confirmSendDialog}
                  style={{ width: "32rem" }}
                  header="Are you sure?, This action is not reversible!!"
                  className="p-fluid"
                  footer={confirmSendDialogFooter}
                  onHide={hideConfirmSendDialog}
                >
                  {confirmSendDialogContent}
                </Dialog>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ViewJobApplicationDetails;