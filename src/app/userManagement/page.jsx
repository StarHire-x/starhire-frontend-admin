"use client";
import React, { useState, useEffect, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Slider } from "primereact/slider";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import {
  updateUser,
  getUsers,
  deleteUser,
  getUserByUserId,
} from "../api/auth/user/route";
import {
  assignJobListing,
  viewOneJobListing,
} from "../api/auth/jobListings/route";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./page.module.css";
import Link from "next/link";

export default function AccountManagement() {
  const session = useSession();

  const router = useRouter();

  const params = useSearchParams();
  const id = params.get("jobListingId");

  const userIdRef =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.userId;

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const [refreshData, setRefreshData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userDialog, setUserDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewUserDialog, setViewUserDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [jobListing, setJobListing] = useState({});
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
  const [statuses] = useState(["Active", "Inactive"]);
  const dt = useRef(null);

  const getStatus = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "danger";
    }
  };

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

  const showUserDialog = (rowData) => {
    setUserDialog(true);
  };

  const showDeleteDialog = (rowData) => {
    setDeleteDialog(true);
  };

  const showViewUserDialog = (rowData) => {
    setViewUserDialog(true);
  };

  const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.status} severity={getStatus(rowData.status)} />;
  };

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={statusItemTemplate}
        placeholder="Select One"
        className="p-column-filter"
        showClear
      />
    );
  };

  const statusItemTemplate = (option) => {
    return <Tag value={option} severity={getStatus(option)} />;
  };

  // ====================================== Trying to assign job seekers to job listing during matching process by updating job listing ======================================
  const handleOnAssignClick = async () => {
    // This part should take in jobSeekerId, jobListingId, and pass it to backend to do the job listing assigning part.
    const jobListingId = jobListing.jobListingId;
    const jobSeekerId = selectedRowData.userId;
    // console.log("HERE!!!");
    // console.log(jobSeekerId);

    try {
      const response = await assignJobListing(
        jobSeekerId,
        jobListingId,
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
    router.push(`/jobListings/viewJobListingRecruiter?id=${id}`);
  };

  const actionAdminBodyTemplate = (rowData) => {
    console.log("Row Data:", rowData);

    // If session.status.user.userId matches rowData.userId, return null or an empty fragment.
    if (userIdRef === rowData.userId) {
      return (
        <React.Fragment>
          <Button
            icon="pi pi-search"
            rounded
            outlined
            className={styles.buttonIcon}
            onClick={() => {
              setSelectedRowData(rowData);
              // showViewUserDialog(rowData);
            }}
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Button
            icon="pi pi-pencil"
            rounded
            outlined
            className={styles.buttonIcon}
            onClick={() => {
              setSelectedRowData(rowData);
              showUserDialog(rowData);
            }}
          />
          {/* <Button
            icon="pi pi-trash"
            rounded
            outlined
            className="mr-2"
            onClick={() => {
              setSelectedRowData(rowData);
              showDeleteDialog(rowData);
            }}
          /> */}
          <Button
            icon="pi pi-search"
            rounded
            outlined
            className={styles.buttonIcon}
            onClick={() => {
              setSelectedRowData(rowData);
              // showViewUserDialog(rowData);
              // pass the rowData to the desired view user profile page
              router?.push(
                `/userProfile/?userId=${rowData?.userId}&role=${rowData?.role}`
              );
            }}
          />
        </React.Fragment>
      );
    }
  };

  const actionRecruiterBodyTemplate = (rowData) => {
    console.log("Row Data:", rowData);
    return (
      <React.Fragment>
        <div className={styles.buttonContainer}>
          <Button
            label="Assign"
            className={styles.assignButton}
            rounded
            onClick={() => {
              setSelectedRowData(rowData);
              showAssignDialog(rowData);
            }}
          />
          <Button
            label="View More Details"
            className="mr-2"
            rounded
            onClick={() => {
              router?.push(
                `/userProfile/?userId=${rowData?.userId}&role=${rowData?.role}&jobListingId=${id}`
              );
            }}
          />
        </div>
      </React.Fragment>
    );
  };

  const hideAssignDialog = () => {
    setAssignDialog(false);
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const hideViewDialog = () => {
    setViewUserDialog(false);
  };

  const saveStatusChange = async () => {
    console.log(selectedRowData);
    try {
      const toggledStatus =
        selectedRowData.status === "Active" ? "Inactive" : "Active";
      const request = {
        role: selectedRowData.role,
        status: toggledStatus,
      };
      console.log(request);
      const response = await updateUser(
        request,
        selectedRowData.userId,
        accessToken
      );
      console.log("Status changed successfully:", response);
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Error changing status:", error);
    }
    setSelectedRowData();
    setUserDialog(false);
  };

  const deleteUserFromRow = async () => {
    console.log(selectedRowData);
    try {
      const request = {
        role: selectedRowData.role,
      };
      console.log(request);
      const response = await deleteUser(
        selectedRowData.role,
        selectedRowData.userId,
        accessToken
      );
      console.log("User is deleted", response);
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setSelectedRowData();
    setDeleteDialog(false);
  };

  const recruiterAssignDialogFooter = (jobSeekerId) => (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        rounded
        outlined
        onClick={hideAssignDialog}
      />
      <Button label="Assign" rounded icon="pi pi-check" onClick={handleOnAssignClick} />
    </React.Fragment>
  );

  const userDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={saveStatusChange} />
    </React.Fragment>
  );

  const deleteUserDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteDialog}
      />
      <Button label="Yes" icon="pi pi-check" onClick={deleteUserFromRow} />
    </React.Fragment>
  );

  const exportCSV = () => {
    dt.current.exportCSV();
  };

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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderAdminHeader = () => {
    return (
      <div className="flex gap-2 justify-content-between align-items-center">
        <h4 className="m-0">Users</h4>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
        <Button
          label="Export CSV"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={exportCSV}
        />
      </div>
    );
  };

  const renderRecruiterHeader = () => {
    return (
      <div className="flex gap-2 justify-content-between align-items-center">
        <h4 className="m-0">Users</h4>
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

  useEffect(() => {
    if (accessToken) {
      viewOneJobListing(id, accessToken)
        .then((data) => {
          setJobListing(data);
        })
        .catch((error) => {
          console.error("Error fetching job listings:", error);
        });
    }
  }, [accessToken, id]);

  useEffect(() => {
    getUsers(accessToken)
      .then((user) => {
        if (session.data.user.role === "Recruiter") {
          // console.log("SEE HERE!!");
          user.data.map(
            (x) => x.role === "Job_Seeker" && console.log(x.jobListings)
          );

          const activeJobSeekers = user.data.filter(
            (x) =>
              x.role === "Job_Seeker" &&
              x.status === "Active" &&
              !x.jobListings
                .map((jobListing) => jobListing.jobListingId)
                .includes(jobListing.jobListingId)
          );
          setUser(activeJobSeekers);
          setIsLoading(false);
        } else {
          setUser(user.data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setIsLoading(false);
      });
  }, [refreshData, accessToken, jobListing]);

  const header = () => {
    if (session.data.user.role === "Administrator") {
      return renderAdminHeader();
    } else {
      return renderRecruiterHeader();
    }
  };

  if (
    session.status === "authenticated" &&
    session.data.user.role !== "Administrator" &&
    session.data.user.role !== "Recruiter"
  ) {
    router?.push("/dashboard");
  }

  if (
    session.status === "authenticated" &&
    (session.data.user.role === "Administrator" ||
      session.data.user.role === "Recruiter")
  ) {
    return (
      <>
        <div className="card">
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
            globalFilterFields={[
              "userName",
              "email",
              "contactNo",
              "status",
              "role",
            ]}
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
            {session.data.user.role === "Administrator" && (
              <Column
                field="status"
                header="Status"
                sortable
                body={statusBodyTemplate}
                filter
                filterElement={statusFilterTemplate}
              ></Column>
            )}
            <Column field="role" header="Role" sortable></Column>
            {session.data.user.role === "Administrator" ? (
              <Column
                body={actionAdminBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            ) : (
              <Column
                body={actionRecruiterBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            )}
            {session.data.user.role === "Administrator" && (
              <Column
                field="createdAt"
                header="Created Date"
                body={(rowData) => formatDate(rowData.createdAt)}
                sortable
              ></Column>
            )}
          </DataTable>
          <div className={styles.backButtonContainer}>
          {session.data.user.role === "Recruiter" && (
            <Button
              label="Back"
              icon="pi pi-chevron-left"
              rounded
              className={styles.backButton}
              onClick={() => handleOnBackClick()}
            />
          )}
        </div>

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

          <Dialog
            visible={userDialog}
            style={{ width: "32rem" }}
            breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            header="Change Status"
            className="p-fluid"
            footer={userDialogFooter}
            onHide={hideDialog}
          >
            <h3>{selectedRowData && selectedRowData.userName}</h3>
          </Dialog>

          <Dialog
            visible={deleteDialog}
            style={{ width: "32rem" }}
            breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            header="Delete user"
            className="p-fluid"
            footer={deleteUserDialogFooter}
            onHide={hideDeleteDialog}
          >
            <h1>{selectedRowData && selectedRowData.userName}</h1>
          </Dialog>

          <Dialog
            visible={viewUserDialog}
            style={{ width: "32rem" }}
            breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            header="User Details"
            modal
            className="p-fluid"
            onHide={hideViewDialog}
          >
            <div className={styles.centerContent}>
              {selectedRowData?.profilePictureUrl && (
                <img
                  src={selectedRowData.profilePictureUrl}
                  alt="User Profile"
                  className={styles.avatar}
                />
              )}
              {selectedRowData?.userId && (
                <div className={styles.inlineField}>
                  <label htmlFor="userId" className="font-bold">
                    User Id:
                  </label>
                  <p>{selectedRowData?.userId}</p>
                </div>
              )}
              {selectedRowData?.userName && (
                <div className={styles.inlineField}>
                  <label htmlFor="userName" className="font-bold">
                    Username:
                  </label>
                  <p>{selectedRowData?.userName}</p>
                </div>
              )}
              {selectedRowData?.email && (
                <div className={styles.inlineField}>
                  <label htmlFor="email" className="font-bold">
                    Email:
                  </label>
                  <p>{selectedRowData?.email}</p>
                </div>
              )}
              {selectedRowData?.fullName && (
                <div className={styles.inlineField}>
                  <label htmlFor="fullName" className="font-bold">
                    Full Name:
                  </label>
                  <p>{selectedRowData?.fullName}</p>
                </div>
              )}

              {/* Corporate specific stuff */}
              {selectedRowData?.companyName && (
                <div className={styles.inlineField}>
                  <label htmlFor="companyName" className="font-bold">
                    Company Name:
                  </label>
                  <p>{selectedRowData?.companyName}</p>
                </div>
              )}
              {selectedRowData?.companyRegistrationId && (
                <div className={styles.inlineField}>
                  <label htmlFor="companyRegistrationId" className="font-bold">
                    Company Registration Id:
                  </label>
                  <p>{selectedRowData?.companyRegistrationId}</p>
                </div>
              )}
              {selectedRowData?.companyAddress && (
                <div className={styles.inlineField}>
                  <label htmlFor="companyAddress" className="font-bold">
                    Company Address:
                  </label>
                  <p>{selectedRowData?.companyAddress}</p>
                </div>
              )}

              {/* Job seeker specific stuff */}
              {selectedRowData?.dateOfBirth && (
                <div className={styles.inlineField}>
                  <label htmlFor="dateOfBirth" className="font-bold">
                    Date of Birth:
                  </label>
                  <p>{formatDate(selectedRowData?.dateOfBirth)}</p>
                </div>
              )}
              {selectedRowData?.homeAddress && (
                <div className={styles.inlineField}>
                  <label htmlFor="homeAddress" className="font-bold">
                    Home Address:
                  </label>
                  <p>{selectedRowData?.homeAddress}</p>
                </div>
              )}

              {selectedRowData?.contactNo && (
                <div className={styles.inlineField}>
                  <label htmlFor="contactNo" className="font-bold">
                    Contact No:
                  </label>
                  <p>{selectedRowData?.contactNo}</p>
                </div>
              )}
              {selectedRowData?.status && (
                <div className={styles.inlineField}>
                  <label htmlFor="status" className="font-bold">
                    Status:
                  </label>
                  <p>{selectedRowData?.status}</p>
                </div>
              )}
              {selectedRowData?.status && (
                <div className={styles.inlineField}>
                  <label htmlFor="notificationMode" className="font-bold">
                    Notification Mode:
                  </label>
                  <p>{selectedRowData?.notificationMode}</p>
                </div>
              )}
              {selectedRowData?.role && (
                <div className={styles.inlineField}>
                  <label htmlFor="role" className="font-bold">
                    Role:
                  </label>
                  <p>{selectedRowData?.role}</p>
                </div>
              )}
              {selectedRowData?.createdAt && (
                <div className={styles.inlineField}>
                  <label htmlFor="createdAt" className="font-bold">
                    Created At:
                  </label>
                  <p>{formatDate(selectedRowData?.createdAt)}</p>
                </div>
              )}
            </div>
          </Dialog>
        </div>
      </>
    );
  }
}
