'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import './styles.css';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { useSession } from 'next-auth/react';
import { viewOneJobListing } from '@/app/api/auth/jobListings/route';
import { updateJobListing } from '@/app/api/auth/jobListings/route';
import HumanIcon from '../../../../public/icon.png';

export default function ViewJobListingRecruiter() {
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

  // const [userDialog, setUserDialog] = useState(false);

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

  const handleRefresh = () => {
    router.push(`/jobListings`); // This will refresh the current page
  };

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
        handleRefresh();
      } else {
        alert('Something went wrong! ERROR CODE:' + response.statusCode);
      }
      console.log('Status changed successfully:', response);
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const handleOnBackClick = () => {
    router.push('/jobListings');
  };

  const handleOnAssignClick = () => {
    router.push(`/userManagement?jobListingId=${id}`);
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

  const footer = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button
        label="Back"
        icon="pi pi-chevron-left"
        rounded
        className="back-button p-button-outlined p-button-secondary"
        onClick={() => handleOnBackClick()}
      />
      <Button
        label="Assign to.."
        icon="pi pi-chevron-right"
        rounded
        className="assign-button p-button-outlined p-button-secondary"
        onClick={() => handleOnAssignClick()}
      />
    </div>
  );

  return (
    <div className="container">
      {isLoading ? (
        <ProgressSpinner
          style={{
            display: 'flex',
            height: '100vh',
            'justify-content': 'center',
            'align-items': 'center',
          }}
        />
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
                {jobListing.corporate.profilePictureUrl === '' ? (
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
              <strong>Required Documents</strong>
              <p>{jobListing.requiredDocuments}</p>
              <strong>Average Salary</strong>
              <p>{'$' + jobListing.averageSalary + ' SGD'}</p>
              <strong>Job Start Date</strong>
              <p>{formatDate(jobListing.jobStartDate)}</p>

              <div className="contact-info">
                <strong>Contact Information</strong>
                <p>{jobListing.corporate.email}</p>
                <p className="second-p">{jobListing.corporate.contactNo}</p>
              </div>

              <strong>Corporate Details</strong>
              <p>
                {'UEN Number: ' + jobListing.corporate.companyRegistrationId}
              </p>
              <p className="second-p">
                {'Address: ' + jobListing.corporate.companyAddress}
              </p>

              <strong>Job Listing Details</strong>
              <p>{formatDate(jobListing.listingDate)}</p>

              <p>{'Job Listing ID: ' + jobListing.jobListingId}</p>

              <strong>Current Status of Job</strong>
              <p
                style={{
                  color:
                    jobListing.jobListingStatus === 'Approved'
                      ? 'green'
                      : 'red',
                }}
              >
                {jobListing.jobListingStatus}
              </p>
            </div>
          </Card>

          {/* <Dialog
            visible={userDialog}
            style={{ width: '32rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            header="Confirm?"
            className="p-fluid"
            footer={userDialogFooter}
            onHide={hideDialog}
          ></Dialog> */}
        </div>
      )}
    </div>
  );
}
