"use client";

import React, { useEffect, useState, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Image from "next/image";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
// import "./styles.css";
import styles from "./viewJobListingRecruiter.module.css";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useSession } from "next-auth/react";
import { viewOneJobListing } from "@/app/api/jobListings/route";
import { updateJobListing } from "@/app/api/jobListings/route";
import { getCorporateDetails, getUsers } from "../../api/auth/user/route";
import { assignJobListing } from "@/app/api/jobListings/route";
import HumanIcon from "../../../../public/icon.png";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import Enums from "@/common/enums/enums";
import UserProfileModal from "@/components/UserProfileModal/UserProfileModal";
import { Toast } from "primereact/toast";

export default function ViewJobListingRecruiter() {
  const session = useSession();

  const router = useRouter();
  const toast = useRef(null);

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

  const [selectedCorporateJP, setSelectedCorporateJP] = useState(null);
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

  //Compute similarity for user
  const computeSimilarityForUsers = (userList) => {
    return userList.map((u) => ({
      ...u,
      similarity: calculateSimilarity(u, selectedCorporateJP),
    }));
  };

  useEffect(() => {
    if (accessToken) {
      viewOneJobListing(id, accessToken)
        .then(async (data) => {
          setJobListing(data);
          setIsLoading(false);

          //Get corporate details
          await getCorporateDetails(data.corporate.userId, accessToken)
            .then((response) => {
              setSelectedCorporateJP(response.data.jobPreference);
              setIsLoading(false);
            })
            .catch((error) => {
              console.error("Error fetching corporate:", error);
              setIsLoading(false);
            });
          
          console.log("Corporate Job Preference", selectedCorporateJP);
          getUsers(accessToken)
            .then((user) => {
              // user.data.map(
              //   (x) => x.role === Enums.JOBSEEKER && console.log(x.jobListings)
              // );

              const activeJobSeekers = user.data.filter(
                (x) =>
                  x.role === Enums.JOBSEEKER &&
                  x.status === Enums.ACTIVE &&
                  !x.jobListings
                    .map((jobListing) => jobListing.jobListingId)
                    .includes(data.jobListingId)
              );

              const sortedUsers = computeSimilarityForUsers(
                activeJobSeekers
              ).sort(
                (a, b) => b.similarity - a.similarity // Sorting in descending order
              );

              setUser(sortedUsers);

              // setUser(activeJobSeekers);
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
  }, [refreshData, selectedCorporateJP, accessToken, id]);

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
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Something went wrong! ERROR CODE:" + response.statusCode,
          life: 5000,
        });
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
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "There was an error matching the job seeker to the job listing",
        life: 5000,
      });
    }
    setSelectedRowData();
    setAssignDialog(false);
  };

  const handleOnBackClick = () => {
    // router.push(`/jobListings`);
    router.back();
  };

  const handleViewJobApplicationClick = () => {
    router.push(`/jobApplications?id=${id}`);
  };

  const handleViewAssignedJobSeekersClick = () => {
    router.push(`/jobListings/viewJobListingRecruiter/viewAssignedJobSeekers?id=${id}&title=${jobListing.title}`)
  }

  const actionRecruiterBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className={styles.buttonContainer}>
          <Button
            label="Assign"
            className={styles.assignButton}
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
      <div className={styles.imageContainer}>
        {avatar !== "" ? (
          <img
            alt={avatar}
            src={avatar}
            className={styles.avatarImageContainer}
          />
        ) : (
          <Image
            src={HumanIcon}
            alt="Icon"
            className={styles.avatarImageContainer}
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

  const getValueOrDefault = (value, defaultValue = 0) => {
    return value == null ? defaultValue : value; // using '==' will check for both null and undefined
  };

  const calculateSimilarity = (userData, corporateData) => {
  
    let userBenefits =
      getValueOrDefault(userData.jobPreference?.benefitPreference) * 20;
    let userWLBalance =
      getValueOrDefault(userData.jobPreference?.workLifeBalancePreference) * 20;
    let userSalary =
      getValueOrDefault(userData.jobPreference?.salaryPreference) * 20;

    if (userBenefits === 0 && userWLBalance === 0 && userSalary === 0) {
      return Number(0).toFixed(2);
    }

    let corporateBenefits =
      getValueOrDefault(corporateData?.benefitPreference) * 20;
    let corporateWLBalance =
      getValueOrDefault(corporateData?.workLifeBalancePreference) * 20;
    let corporateSalary =
      getValueOrDefault(corporateData?.salaryPreference) * 20;

    console.log("Hello there")
    console.log(userBenefits);
    console.log(userWLBalance);
    console.log(userSalary);
    console.log("--------------------------");
    console.log(corporateBenefits);
    console.log(corporateWLBalance);
    console.log(corporateSalary);

    let dotProduct =
      userBenefits * corporateBenefits +
      userWLBalance * corporateWLBalance +
      userSalary * corporateSalary;

    let userMagnitude = Math.sqrt(
      Math.pow(userBenefits, 2) +
        Math.pow(userWLBalance, 2) +
        Math.pow(userSalary, 2)
    );
    let corporateMagnitude = Math.sqrt(
      Math.pow(corporateBenefits, 2) +
        Math.pow(corporateWLBalance, 2) +
        Math.pow(corporateSalary, 2)
    );

    // Ensure we don't divide by zero and handle NaN case
    let similarity;
    if (userMagnitude === 0 || corporateMagnitude === 0) {
      similarity = 0;
    } else {
      similarity = dotProduct / (userMagnitude * corporateMagnitude);
    }

    // Convert similarity to percentage
    let percentageSimilarity = parseFloat(((similarity + 1) / 2) * 100).toFixed(
      2
    );

    return percentageSimilarity;
  };

  const header = () => {
    return renderRecruiterHeader();
  };

  return (
    <div>
      <Toast ref={toast} />
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
        <div className={styles.contentContainer}>
          <Card
            title={jobListing.title}
            subTitle={jobListing.jobLocation}
            className={styles.myCard}
            style={{ borderRadius: "0" }}
          >
            <div className={`${styles.pCardContent}`}>
              <div className={styles.companyInfo}>
                {jobListing.corporate.profilePictureUrl === "" ? (
                  <Image src={HumanIcon} alt="User" className={styles.avatar} />
                ) : (
                  <img
                    src={jobListing.corporate.profilePictureUrl}
                    className={styles.avatar}
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
                <p className={styles.secondP}>
                  {jobListing.corporate.contactNo}
                </p>
              </div>

              <strong>Corporate Details</strong>
              <p>
                {"UEN Number: " + jobListing.corporate.companyRegistrationId}
              </p>
              <p className={styles.secondP}>
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
          <div>
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
              style={{ minWidth: "50vw" }}
            >
              <Column
                field="userName"
                header="User Name"
                sortable
                body={usernameBodyTemplate}
              ></Column>
              <Column field="email" header="Email" sortable></Column>
              <Column field="contactNo" header="Contact No" sortable></Column>
              {/* <Column
                field="role"
                header="Role"
                body={statusRoleTemplate}
                sortable
              ></Column> */}
              <Column
                field="similarity"
                header="Similarity Score (%)"
                sortable
              ></Column>
              <Column
                body={actionRecruiterBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>

            <div className={styles.bottomButtonContainer}>
              <Button
                label="Back"
                icon="pi pi-chevron-left"
                rounded
                size="medium"
                className="p-button-info"
                onClick={() => handleOnBackClick()}
              />
              <Button
                label="View Assigned Job Seekers"
                rounded
                size="medium"
                className="p-button-success"
                onClick={() => handleViewAssignedJobSeekersClick()}
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

          <Dialog
            header="User Profile"
            visible={userProfileModalVisibility}
            onHide={() => setUserProfileModalVisibility(false)}
          >
            <UserProfileModal
              selectedUser={selectedUser}
              currentUserRole={currentUserRole}
              selectedCorporateJP={selectedCorporateJP}
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
    </div>
  );
}
