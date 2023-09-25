"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { useSearchParams } from "next/navigation";
import { Tag } from "primereact/tag";
import { viewAllJobApplicationsByJobListingId } from "../api/auth/jobApplications/route";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

export default function CustomersDemo() {
  const session = useSession();

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const params = useSearchParams();
  const jobListingId = params.get("id");

  const [jobApplications, setJobApplications] = useState([]);
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
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

      case "Waiting_For_Interview":
        return null;
    }
  };

  useEffect(() => {
    if (accessToken) {
      viewAllJobApplicationsByJobListingId(jobListingId, accessToken).then(
        (data) => {
          setJobApplications(data);
        }
      );
    }
    // const populateData = async () => {
    //   try {
    //     const allJobApplications = await viewAllJobApplicationsByJobListingId(
    //       jobListingId,
    //       accessToken
    //     );
    //     setJobApplications(allJobApplications);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    // populateData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (value) => {
    return value.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-2 justify-content space-between align-items-center">
        <h4 className="m-0">Job Applications</h4>
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
    return rowData?.jobSeeker?.userName;
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
        value={rowData?.jobApplicationStatus}
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

  const sendCorporateButtons = () => {
    return (
      <Button
        rounded
        size="small"
        severity="secondary"
        label="Send Corporate"
      />
    );
  };

  const viewDetailsButtons = () => {
    return <Button rounded size="small" severity="help" label="View Details" />;
  };

  const header = renderHeader();

  return (
    <div className="card">
      <DataTable
        value={jobApplications}
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
        filters={filters}
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
          filterElement={statusFilterTemplate}
        />
        <Column
          field="submissionDate"
          header="Submitted Date"
          sortable
          style={{ minWidth: "12rem" }}
          body={submittedDateBodyTemplate}
        />
        <Column style={{ minWidth: "12rem" }} body={sendCorporateButtons} />
        <Column style={{ minWidth: "12rem" }} body={viewDetailsButtons} />
      </DataTable>
    </div>
  );
}
