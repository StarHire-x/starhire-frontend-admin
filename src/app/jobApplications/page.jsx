"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { useSearchParams } from "next/navigation";
import { Tag } from "primereact/tag";
import {
  updateJobApplicationStatus,
  viewAllJobApplicationsByJobListingId,
} from "../api/auth/jobApplications/route";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DialogBox } from "../../components/DialogBox/DialogBox";
import { ProgressSpinner } from "primereact/progressspinner";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./page.module.css";

export default function CustomersDemo() {
  const session = useSession();
  const router = useRouter();
  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId = session.data && session.data.user?.userId;

  const params = useSearchParams();
  const jobListingId = params.get("id");

  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [jobApplicationToSend, setJobApplicationToSend] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
  const [filteredJobApplications, setFilteredJobApplications] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    userName: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    email: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    contactNo: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    jobApplicationStatus: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    submissionDate: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const statuses = [
    "Rejected",
    "Accepted",
    "Submitted",
    "Processing",
    "Waiting_For_Interview",
    "To_Be_Submitted",
  ];
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
        return null;
    }
  };

  const populateData = async () => {
    try {
      const allJobApplications = await viewAllJobApplicationsByJobListingId(
        jobListingId,
        currentUserId,
        accessToken
      );
      setJobApplications(allJobApplications);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    setIsLoading(true);
    populateData();
  }, [jobListingId, currentUserId, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (value) => {
    return value.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filterData = (value) => {
    if (value === "") {
      setFilteredJobApplications([]);
    } else {
      const filteredApplications = jobApplications.filter((application) => {
        // Check if the global filter value matches any of the job seeker attributes
        const jobSeeker = application.jobSeeker;
        if (!jobSeeker) {
          return false;
        } else {
          // console.log(jobSeeker);
          const { userName, email, contactNo } = jobSeeker;
          // console.log("RETRIEVING");
          // console.log(userName);
          return (
            (userName && userName.includes(value)) ||
            (email && email.includes(value)) ||
            (contactNo && contactNo.includes(value)) ||
            application.jobApplicationStatus?.includes(value) ||
            application.submissionDate?.includes(value)
          );
        }
      });
      // console.log("FILTERED APPS HERE!");
      // console.log(filteredApplications.length)
      setFilteredJobApplications(filteredApplications);
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
    // console.log("VALUE IS HERE", value);
    filterData(value);
  };

  const renderHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">Job Applications for Job Listing {jobListingId}</h2>
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

  const usernameBodyTemplate = (rowData) => {
    return (
      <div className={styles.userDetails}>
        {rowData?.jobSeeker?.profilePictureUrl === "" ? (
          <Image
            src={HumanIcon}
            alt="Profile Picture"
            className={styles.avatar}
          />
        ) : (
          <img
            src={rowData.jobSeeker.profilePictureUrl}
            alt="user"
            className={styles.avatar}
          />
        )}
        <p>{rowData?.jobSeeker?.userName}</p>
      </div>
    );
  };

  const emailBodyTemplate = (rowData) => {
    return rowData?.jobSeeker?.email;
  };

  const contactNumberBodyTemplate = (rowData) => {
    return rowData?.jobSeeker?.contactNo;
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData?.jobApplicationStatus?.replaceAll("_", " ")}
        severity={getSeverity(rowData?.jobApplicationStatus)}
      />
    );
  };

  const statusItemTemplate = (option) => {
    return <Tag value={option} severity={getSeverity(option)} />;
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

  const submittedDateBodyTemplate = (rowData) => {
    return formatDate(new Date(rowData?.submissionDate));
  };

  const sendCorporateButtons = (rowData) => {
    return rowData?.jobApplicationStatus === "Submitted" ? (
      <Button
        rounded
        outlined
        severity="info"
        icon="pi pi-send"
        onClick={() => {
          setOpenDialog(true);
          setJobApplicationToSend(rowData);
        }}
      />
    ) : (
      <></>
    );
  };

  const viewDetailsButtons = (jobApplicationId) => {
    return (
      <Button
        rounded
        outlined
        severity="help"
        icon="pi pi-align-justify"
        onClick={() => {
          router.push(
            `/jobApplications/viewJobApplication?id=${jobApplicationId}`
          );
        }}
      />
    );
  };

  const footerButtons = () => {
    return (
      <div className="flex-container space-between">
        <Button
          label="No"
          icon="pi pi-times"
          onClick={() => setOpenDialog(false)}
          className="p-button-text"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          onClick={() => {
            setOpenDialog(false);
            updateStatus();
          }}
          autoFocus
        />
      </div>
    );
  };

  const handleOnBackClick = () => {
    router.push("/jobListings");
  };

  const updateStatus = async () => {
    const request = {
      jobApplicationStatus: "Processing",
    };
    try {
      await updateJobApplicationStatus(
        request,
        jobApplicationToSend?.jobApplicationId,
        accessToken
      );
      await populateData(); // should optimize
    } catch (error) {
      console.log(error);
    }
  };

  const header = renderHeader();

  return (
    <div className="card">
      <DialogBox
        header="Send to Corporate?"
        content={`Sending Job Application ID ${jobApplicationToSend?.jobApplicationId} for ${jobApplicationToSend?.jobSeeker?.userName}.`}
        footerContent={footerButtons}
        isOpen={openDialog}
        setVisible={setOpenDialog}
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
        <>
          <DataTable
            scrollable
            scrollHeight="400px"
            value={
              globalFilterValue != ""
                ? filteredJobApplications
                : jobApplications
            }
            paginator
            header={header}
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[10, 25, 50]}
            dataKey="id"
            selectionMode="checkbox"
            selection={selectedJobApplications}
            onSelectionChange={(e) => {
              console.log(e);
              setSelectedJobApplications(e.value);
            }}
            // filters={filters}
            filterDisplay="menu"
            globalFilterFields={[
              "userName",
              "email",
              "contactNo",
              "jobApplicationStatus",
              "submissionDate",
            ]}
            emptyMessage="No job applications found."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "3rem" }}
            ></Column>
            <Column
              field="userName"
              header="Username"
              sortable
              style={{ minWidth: "12rem" }}
              body={usernameBodyTemplate}
            />
            <Column
              field="email"
              header="Email"
              sortable
              style={{ minWidth: "12rem" }}
              body={emailBodyTemplate}
            />
            <Column
              field="contactNo"
              header="Contact Number"
              sortable
              style={{ minWidth: "12rem" }}
              body={contactNumberBodyTemplate}
            />
            <Column
              field="jobApplicationStatus"
              header="Status"
              filterMenuStyle={{ width: "14rem" }}
              style={{ minWidth: "12rem" }}
              body={statusBodyTemplate}
              sortable
              filter
              filterElement={statusFilterTemplate}
            />
            <Column
              field="submissionDate"
              header="Submitted Date"
              sortable
              style={{ minWidth: "12rem" }}
              body={submittedDateBodyTemplate}
            />
            <Column body={sendCorporateButtons} />
            <Column
              body={(rowData) => viewDetailsButtons(rowData?.jobApplicationId)}
            />
          </DataTable>
        </>
      )}
      <div className={styles.backButtonContainer}>
        <Button
          label="Back"
          icon="pi pi-chevron-left"
          rounded
          className={styles.backButton}
          onClick={() => handleOnBackClick()}
        />
      </div>
    </div>
  );
}
