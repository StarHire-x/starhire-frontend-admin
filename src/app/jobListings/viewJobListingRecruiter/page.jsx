"use client";

import React, { useEffect, useState, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Image from "next/image";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import "./styles.css";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useSession } from "next-auth/react";
import { viewOneJobListing } from "@/app/api/auth/jobListings/route";
import { updateJobListing } from "@/app/api/auth/jobListings/route";
import { getUsers } from "../../api/auth/user/route";
import { assignJobListing } from "@/app/api/auth/jobListings/route";
import HumanIcon from "../../../../public/icon.png";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import Enums from "@/common/enums/enums";
import UserProfileModal from "@/components/UserProfileModal/UserProfileModal";

export default function ViewJobListingRecruiter() {
  const session = useSession();

  const router = useRouter();

  if (session.status === "unauthenticated") {
    router.push("/login");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === "authenticated" && session.data.user.userId;

  const currentUserRole =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.role;

  const params = useSearchParams();
  const id = params.get("id");

  const [jobListing, setJobListing] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [assignDialog, setAssignDialog] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [status, setStatus] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [userProfileModalVisibility, setUserProfileModalVisibility] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    status: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const dt = useRef(null);

  useEffect(() => {
    if (accessToken) {
      viewOneJobListing(id, accessToken)
        .then((data) => {
          setJobListing(data);
          setIsLoading(false);

          getUsers(accessToken)
            .then((user) => {
              user.data.map(
                (x) => x.role === Enums.JOBSEEKER && console.log(x.jobListings)
              );

              const activeJobSeekers = user.data.filter(
                (x) =>
                  x.role === Enums.JOBSEEKER &&
                  x.status === Enums.ACTIVE &&
                  !x.jobListings
                    .map((jobListing) => jobListing.jobListingId)
                    .includes(data.jobListingId)
              );
              setUser(activeJobSeekers);
              setIsLoading(false);
            })
            .catch((error) => {
              console.error("Error fetching user:", error);
              setIsLoading(false);
            });
        })
        .catch((error) => {
          console.error("Error fetching job listings:", error);
          setIsLoading(false);
        });
    }
  }, [refreshData, accessToken, id]);

  const handleRefresh = () => {
    router.push(`/jobListings`); // This will refresh the current page
  };

  // Function to format date in "day-month-year" format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
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
        alert("Something went wrong! ERROR CODE:" + response.statusCode);
      }
      console.log("Status changed successfully:", response);
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  const hideDialog = () => {
    setUserDialog(false);
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

  // ============================ Code to populate datatable ============================
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const showAssignDialog = (rowData) => {
    setAssignDialog(true);
  };

  const hideAssignDialog = () => {
    setAssignDialog(false);
  };

  const handleOnAssignClick = async () => {
    // This part should take in jobSeekerId, jobListingId, and pass it to backend to do the job listing assigning part.
    const jobListingId = jobListing.jobListingId;
    const jobSeekerId = selectedRowData.userId;
    const recruiterId = session.data.user.userId;
    // console.log("HERE!!!");
    // console.log(jobSeekerId);

    try {
      const response = await assignJobListing(
        jobSeekerId,
        jobListingId,
        recruiterId,
        accessToken
      );
      console.log("Job Seeker has been assigned to Job Listing", response);
      // alert('Job Seeker has been matched with Job Listing successfully');
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error(
        "There was an error matching the job seeker to the job listing:",
        error.message
      );
      alert("There was an error matching the job seeker to the job listing");
    }
    setSelectedRowData();
    setAssignDialog(false);
  };

  const handleOnBackClick = () => {
    router.push(`/jobListings`);
  };

  const handleViewJobApplicationClick = () => {
    router.push(`/jobApplications?id=${id}`);
  };

  const actionRecruiterBodyTemplate = (rowData) => {
    console.log("Row Data:", rowData);
    return (
      <React.Fragment>
        <div className="button-container">
          <Button
            label="Assign"
            className="assign-button"
            rounded
            size="small"
            onClick={() => {
              setSelectedRowData(rowData);
              showAssignDialog(rowData);
            }}
          />
          <Button
            label="View More Details"
            className="mr-2"
            rounded
            size="small"
            onClick={() => {
              setSelectedUser(rowData);
              setUserProfileModalVisibility(true);
            }}
            // onClick={() => {
            //   router?.push(
            //     `/userProfile/?userId=${rowData?.userId}&role=${rowData?.role}&jobListingId=${id}`
            //   );
            // }}
          />
        </div>
      </React.Fragment>
    );
  };

  const statusRoleTemplate = (rowData) => {
    return <Tag value={rowData?.role?.replaceAll("_", " ")} />;
  };

  const recruiterAssignDialogFooter = (jobSeekerId) => (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        rounded
        outlined
        size="small"
        onClick={hideAssignDialog}
      />
      <Button
        label="Assign"
        rounded
        icon="pi pi-check"
        size="small"
        onClick={handleOnAssignClick}
      />
    </React.Fragment>
  );

  const usernameBodyTemplate = (rowData) => {
    const userName = rowData.userName;
    const avatar = rowData.profilePictureUrl;

    return (
      <div className="image-container">
        {avatar !== "" ? (
          <img alt={avatar} src={avatar} className="avatar-image-container" />
        ) : (
          <Image
            src={HumanIcon}
            alt="Icon"
            className="avatar-image-container"
          />
        )}
        <span>{userName}</span>
      </div>
    );
  };

  const renderRecruiterHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">Assign Users for Job Listing {id}</h2>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
      </div>
    );
  };

  const header = () => {
    return renderRecruiterHeader();
  };

  return (
    <div className="container">
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
        <div className="content-container">
          <Card
            title={jobListing.title}
            subTitle={jobListing.jobLocation}
            className="my-card"
            style={{ borderRadius: "0" }}
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
              <strong>Required Documents</strong>
              <p>{jobListing.requiredDocuments}</p>
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
              <p>
                {"UEN Number: " + jobListing.corporate.companyRegistrationId}
              </p>
              <p className="second-p">
                {"Address: " + jobListing.corporate.companyAddress}
              </p>

              <strong>Job Listing Details</strong>
              <p>{formatDate(jobListing.listingDate)}</p>

              <p>{"Job Listing ID: " + jobListing.jobListingId}</p>

              <strong>Current Status of Job</strong>
              <p
                style={{
                  color:
                    jobListing.jobListingStatus === "Approved"
                      ? "green"
                      : "red",
                }}
              >
                {jobListing.jobListingStatus}
              </p>
            </div>
          </Card>

          <DataTable
            value={user}
            paginator
            ref={dt}
            header={header}
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[10, 25, 50]}
            dataKey="id"
            selectionMode="checkbox"
            selection={selectedUsers}
            onSelectionChange={(e) => setSelectedUsers(e.value)}
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={["userName", "email", "contactNo", "role"]}
            emptyMessage="No users found."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column
              field="userName"
              header="User Name"
              sortable
              body={usernameBodyTemplate}
            ></Column>
            <Column field="email" header="Email" sortable></Column>
            <Column field="contactNo" header="Contact No" sortable></Column>
            <Column
              field="role"
              header="Role"
              body={statusRoleTemplate}
              sortable
            ></Column>
            <Column
              body={actionRecruiterBodyTemplate}
              exportable={false}
              style={{ minWidth: "12rem" }}
            ></Column>
          </DataTable>

          <Dialog
            header="User Profile"
            visible={userProfileModalVisibility}
            onHide={() => setUserProfileModalVisibility(false)}
          >
            <UserProfileModal
              selectedUser={selectedUser}
              currentUserRole={currentUserRole}
            />
          </Dialog>

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
              Do you wish to assign Job Listing {jobListing.jobListingId} to{" "}
              {selectedRowData && selectedRowData.userName}?
            </h3>
          </Dialog>
        </div>
      )}
      <div className="bottom-button-container">
        <Button
          label="Back"
          icon="pi pi-chevron-left"
          rounded
          size="medium"
          className="back-button"
          onClick={() => handleOnBackClick()}
        />
        <Button
          label="View Job Applications"
          rounded
          size="medium"
          className="p-button-warning"
          onClick={() => handleViewJobApplicationClick()}
        />
      </div>
    </div>
  );
}
