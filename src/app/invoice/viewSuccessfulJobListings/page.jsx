"use client";
import styles from "./viewSuccessfulJobListings.module.css";

import React, { useEffect, useState, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Image from "next/image";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useSession } from "next-auth/react";
import HumanIcon from "../../../../public/icon.png";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Enums from "@/common/enums/enums";
import { InputText } from "primereact/inputtext";
import {
  getAllCorporates,
  getCorporateDetails,
} from "../../api/auth/user/route";
import moment from "moment";

export default function ViewSuccessfulJobListings() {
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

  const dt = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [successfulJobListings, setSuccessfulJobListings] = useState([]);
  const [corporate, setCorporate] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
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

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const params = useSearchParams();
  const corporateId = params.get("corporateId");

  //Fetch the corporate details
  useEffect(() => {
    if (accessToken) {
      const fetchOneCorporate = async () => {
        try {
          const corporate = await getCorporateDetails(corporateId, accessToken);
          setCorporate(corporate.data);

          // const jobListings = corporate.data.jobListings.filter(
          //   (jobListing) => {
          //     return jobListing.jobApplications.some(
          //       (jobApplication) =>
          //         jobApplication.jobApplicationStatus === "Offer_Accepted"
          //     );
          //   }
          // );
          setSuccessfulJobListings(corporate.data.jobListings);
        } catch (error) {
          console.log("There was a problem fetching the corporate user", error);
        }
      };
      fetchOneCorporate();
    }
    setIsLoading(false);
  }, [accessToken]);

  useEffect(() => {
    console.log("SEEHERE!");
    console.log(selectedRows);
  });

  const renderAdminHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">Job Listings of {corporate.userName}</h2>
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

  const renderRowExpansionHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">Successful Job Applications</h2>
      </div>
    );
  };

  const header = () => {
    return renderAdminHeader();
  };

  const rowExpansionHeader = () => {
    return renderRowExpansionHeader();
  };

  const handleSuccessfulJobListings = (rowData) => {
    if (accessToken) {
      return;
    }
  };

  const handleOnBackClick = () => {
    router.back();
  };

  const handleCreateClick = () => {
    console.log("selected rows");
    console.log(selectedRows);
  };

  //Row Expansion Codes
  const allowExpansion = (rowData) => {
    return rowData.jobApplications.length > 0;
  };

  const rowExpansionTemplate = (data) => {
    const { jobApplications, averageSalary } = data;
    return (
      <div className="p-3">
        <DataTable
          header={rowExpansionHeader}
          value={jobApplications}
          emptyMessage="No successful job listings found."
          selection={selectedRows}
          onSelectionChange={(e) => setSelectedRows(e.value)}
          style={{ margin: "10px", border: "1px solid #000" }}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
          <Column
            field="jobApplicationId"
            header="Job Application ID"
            sortable
          ></Column>
          <Column
            field="recruiter.userName"
            header="Assigned By"
            sortable
          ></Column>
          <Column
            // field="averageSalary"
            header="Commission"
            sortable
            body={(rowData) => `$${averageSalary}`} 
          ></Column>
        </DataTable>
      </div>
    );
  };

  return (
    <div>
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
          <div>
            <DataTable
              value={successfulJobListings}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={(data) =>
                rowExpansionTemplate({
                  jobApplications: data.jobApplications.filter(
                    (jobApplication) =>
                      jobApplication.jobApplicationStatus === "Offer_Accepted"
                  ),
                  averageSalary: data.averageSalary,
                })
              }
              paginator
              ref={dt}
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="jobListingId"
              filters={filters}
              filterDisplay="menu"
              globalFilterFields={["jobListingId", "title"]}
              emptyMessage="No corporate users found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              style={{ minWidth: "50vw" }}
            >
              <Column expander={allowExpansion} style={{ width: "5rem" }} />
              <Column
                field="jobListingId"
                header="Job Listing ID"
                sortable
              ></Column>
              <Column field="title" header="Title" sortable></Column>
              <Column
                field="listingDate"
                header="Posted On"
                sortable
                body={(rowData) =>
                  moment(rowData.listingDate).format("YYYY/MM/DD")
                }
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
                label="Create Invoice"
                rounded
                size="medium"
                className="p-button-warning"
                onClick={() => handleCreateClick()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
