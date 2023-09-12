"use client";

import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Button } from 'primereact/button';
import './styles.css';
import { Jolly_Lodger } from "next/font/google";
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation'
import { Dialog } from "primereact/dialog";
import { useSession } from "next-auth/react";

export default function ViewJobListingAdmin() {
  const session = useSession();

  const router = useRouter();

  const params = useSearchParams();
  const id = params.get("id");

  const [jobListing, setJobListing] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [userDialog, setUserDialog] = useState(false);

  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/job-listing/${id}`)
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
  }, []);

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

  //API call
  const updateJobListingStatusAPICall = async (request, id) => {
    try {
      const res = await fetch(`http://localhost:8080/job-listing/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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

  const updateJobListingStatus = async (newStatus) => {
    try {
      const request = {
        jobListingStatus: newStatus,
      };
      const response = await updateJobListingStatusAPICall(request, id);
      console.log("Status changed successfully:", response);
    } catch (error) {
      console.error("Error changing status:", error);
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
      <Button label="Yes" icon="pi pi-check" outlined onClick={() => updateJobListingStatus(status)} />
    </React.Fragment>
  );

  const footer = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button
        label="Approve"
        icon="pi pi-check"
        className="approve-button p-button-outlined p-button-secondary"
        onClick={() => showUserDialog("Active")}
      />
      <Button
        label="Reject"
        icon="pi pi-times"
        className="reject-button p-button-outlined p-button-secondary"
        onClick={() => showUserDialog("Inactive")}
      />
      <Button
        label="Archive"
        icon="pi pi-times"
        className="archive-button p-button-outlined p-button-secondary"
        onClick={() => showUserDialog("Unverified")}
      />
    </div>
  );


  return (
    <div>
      {isLoading ? (
        <div className="loading-animation">
          <div className="spinner"></div>
        </div>
      ) : (
        <div>
          <Card
            title={jobListing.title}
            subTitle={jobListing.jobLocation}
            footer={footer}
            className="my-card"
            style={{ borderRadius: "0" }}
          >
            <div className="my-card.p-card-content">
              <strong>Job Desription</strong>
              <p>{jobListing.description}</p>
            </div>
          </Card>
          
          <Dialog
            visible={userDialog}
            style={{ width: "32rem" }}
            breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            header="Confirm?"
            className="p-fluid"
            footer={userDialogFooter}
            onHide={hideDialog}
          >
          </Dialog>
        </div>
      )}
    </div>
  );
}
