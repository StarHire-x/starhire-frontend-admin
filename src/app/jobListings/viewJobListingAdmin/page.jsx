'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import './styles.css';
import { Jolly_Lodger } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from "primereact/progressspinner";
import { useSession } from 'next-auth/react';
import { viewOneJobListing } from '@/app/api/auth/jobListings/route';
import { updateJobListing } from '@/app/api/auth/jobListings/route';
import { informJobListingStatus } from '@/app/api/auth/jobListings/route';
import HumanIcon from "../../../../public/icon.png";

export default function ViewJobListingAdmin() {
  const session = useSession();

  const router = useRouter();

  const accessToken =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === 'authenticated' && session.data.user.userId;

  const params = useSearchParams();
  const id = params.get('id');

  const [jobListing, setJobListing] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [userDialog, setUserDialog] = useState(false);

  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (accessToken) {
      viewOneJobListing(id, accessToken)
        .then((data) => {
          setJobListing(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching job listings:', error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);

  /*
  useEffect(() => {
    fetch(`http://localhost:8080/job-listing/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setJobListing(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, [accessToken]);
  */

  /*
  const header = (
    <img
      alt="Card"
      src="https://primefaces.org/cdn/primereact/images/usercard.png"
    />
  );
  */

  /*
  <div className="p-col">
                <strong>Listing Date:</strong>
                <p>{new Date(jobListing.listingDate).toLocaleDateString()}</p>
              </div>
              */

  const handleRefresh = () => {
    router.push(`/jobListings`); // This will refresh the current page
  };

  //Old API call
  /*
  const updateJobListingStatusAPICall = async (accessToken, request, id) => {
    try {
      const res = await fetch(`http://localhost:8080/job-listing/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(request),
      });

      console.log(res);
      if (res.ok) {
        handleRefresh();
        //return;
      } else {
        throw new Error(errorData.message || "An error occurred");
      }
    } catch (error) {
      console.log("There was a problem", error);
      throw error;
    }
  };
  */

  // Function to format date in "day-month-year" format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const updateJobListingStatus = async (newStatus) => {
    try {
      const request = {
        jobListingStatus: newStatus,
      };
      //const response = await updateJobListingStatusAPICall(request, id);
      const response = await updateJobListing(accessToken, request, id);

      if (response.statusCode === 200) {
        informJobListingStatusMethod(id, accessToken);
        handleRefresh();
      } else {
        alert('Something went wrong! ERROR CODE:' + response.statusCode);
      }
      console.log('Status changed successfully:', response);
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  //Send email about change in state for job listing
    const informJobListingStatusMethod = async (jobListingId) => {
      try {
        //This is the backend API call
        const response = await informJobListingStatus(jobListingId, accessToken);
    
        if (response.status === 200) {
          console.log('Job listing status email sent successfully');
        } else {
          console.error('Failed to send job listing status email' + JSON.stringify(response));
        }
      } catch (error) {
        console.error('Error sending job listing status email:', error);
      }
    }; 

  /*
  const footer = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button
        label="Approve"
        icon="pi pi-check"
        className="approve-button p-button-outlined p-button-secondary"
        onClick={() => updateJobListingStatus("Active")}
      />
      <Button
        label="Reject"
        icon="pi pi-times"
        className="reject-button p-button-outlined p-button-secondary"
        onClick={() => updateJobListingStatus("Inactive")}
      />
      <Button
        label="Archive"
        icon="pi pi-times"
        className="archive-button p-button-outlined p-button-secondary"
        onClick={() => updateJobListingStatus("Unverifie1d")}
      />
    </div>
  );
  */
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
        onClick={() => updateJobListingStatus(status)}
      />
    </React.Fragment>
  );

  /*
  const footer = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button
        label="Approve"
        icon="pi pi-check"
        className="approve-button p-button-outlined p-button-secondary"
        onClick={() => showUserDialog('Active')}
      />
      <Button
        label="Reject"
        icon="pi pi-times"
        className="reject-button p-button-outlined p-button-secondary"
        onClick={() => showUserDialog('Inactive')}
      />
      <Button
        label="Archive"
        icon="pi pi-folder"
        className="archive-button p-button-outlined p-button-secondary"
        onClick={() => showUserDialog('Inactive')}
      />
    </div>
  );
  */

  const footer = (
    <div className="flex flex-wrap justify-content-end gap-2">
      {(jobListing.jobListingStatus === 'Unverified' || jobListing.jobListingStatus === 'Rejected' || jobListing.jobListingStatus === 'Archived') && (
        <Button
          label="Approve"
          icon="pi pi-check"
          className="approve-button p-button-outlined p-button-secondary"
          onClick={() => showUserDialog('Approved')}
        />
      )}
      {jobListing.jobListingStatus === 'Unverified' && (
        <Button
          label="Reject"
          icon="pi pi-times"
          className="reject-button p-button-outlined p-button-secondary"
          onClick={() => showUserDialog('Rejected')}
        />
      )}
      {(jobListing.jobListingStatus === 'Approved' || jobListing.jobListingStatus === 'Rejected') && (
        <Button
          label="Archive"
          icon="pi pi-folder"
          className="archive-button p-button-outlined p-button-secondary"
          onClick={() => showUserDialog('Archived')}
        />
      )}
    </div>
  );
  
  

  return (
    <div className="container">
      {isLoading ? (
        <ProgressSpinner style={{"display": "flex", "height": "100vh", "justify-content": "center", "align-items": "center"}}/>
      ) : (
        <div>
          <Card
            title={jobListing.title}
            subTitle={jobListing.jobLocation}
            footer={footer}
            className="my-card"
            style={{ borderRadius: '0' }}
          >
            <div className="my-card.p-card-content">
              <div className="company-info">
              {jobListing.corporate.profilePictureUrl === "" ? (
                  <Image src={HumanIcon} alt="User" className="avatar" />
                ) : (
                <img
                  src={jobListing.corporate.profilePictureUrl}
                  className="avatar"
                />
              )}
                <div className="company-details">
                  <p>{jobListing.corporate.userName}</p>
                </div>
              </div>

              <strong>Job Overview</strong>
              <p>{jobListing.overview}</p>
              <strong>Job Responsibilities</strong>
              <p>{jobListing.responsibilities}</p>
              <strong>Job Requirements</strong>
              <p>{jobListing.requirements}</p>
              <strong>Average Salary</strong>
              <p>{"$" + jobListing.averageSalary + " SGD"}</p>
              <strong>Job Start Date</strong>
              <p>{formatDate(jobListing.jobStartDate)}</p>

              <div className="contact-info">
                <strong>Contact Information</strong>
                <p>{jobListing.corporate.email}</p>
                <p className="second-p">{jobListing.corporate.contactNo}</p>
              </div>

              <strong>Corporate Details</strong>
              <p>{"UEN Number: " + jobListing.corporate.companyRegistrationId}</p>
              <p className="second-p">{"Address: " + jobListing.corporate.companyAddress}</p>

              <strong>Job Listing Details</strong>
              <p>{formatDate(jobListing.listingDate)}</p>

              <p>{"Job Listing ID: " + jobListing.jobListingId}</p>

              <strong>Current Status of Job</strong>
              <p
                style={{
                  color:
                    jobListing.jobListingStatus === 'Approved' ? 'green' : 'red',
                }}
              >
                {jobListing.jobListingStatus}
              </p>
            </div>
          </Card>

          <Dialog
            visible={userDialog}
            style={{ width: '32rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            header="Confirm?"
            className="p-fluid"
            footer={userDialogFooter}
            onHide={hideDialog}
          ></Dialog>
        </div>
      )}
    </div>
  );
}
