"use client";
import styles from "./ViewSuccessfulJobAppsPage.module.css";

import React, { useEffect, useState, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useSession } from "next-auth/react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Enums from "@/common/enums/enums";
import { InputText } from "primereact/inputtext";
import { getCorporateDetails } from "../../api/auth/user/route";
import moment from "moment";
import { createInvoice } from "@/app/api/invoice/route";
import { Toast } from "primereact/toast";
import {
  getAllCommissionRates,
  getAllYetCommissionedSuccessfulJobAppsByRecruiterId,
} from "@/app/api/commission/route";

const ViewSuccessfulJobAppsPage = () => {
  const session = useSession();
  const router = useRouter();
  const toast = useRef(null);

  const currentUserRole =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.role;

  if (session.status === "unauthenticated") {
    router.push("/login");
  }

  if (session.status === "authenticated" && currentUserRole !== Enums.ADMIN) {
    router.push("/dashboard");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === "authenticated" && session.data.user.userId;

  const dt = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const [
    yetCommissionedSuccessfulJobApps,
    setYetCommissionedSuccessfulJobApps,
  ] = useState([]);

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

  const [selectedJobApps, setSelectedJobApps] = useState(null);

  const params = useSearchParams();
  const recruiterId = params.get("recruiterId");
  const recruiterUserName = params.get("recruiterUserName");
 

  const [commissionRate, setCommissionRate] = useState({});

  useEffect(() => {
    if (accessToken) {
      getAllCommissionRates(accessToken).then((response) => {
        if (response.length > 0) {
          setCommissionRate(response[0]?.commissionRate);
        }
      });
    }
  }, [accessToken]);

  // fetch yet-commissioned successful job apps
  useEffect(() => {
    if (accessToken) {
      const fetchYetCommissionedSuccessfulJobApps = async () => {
        try {
          const yetCommissionedSuccessfulJobApps =
            await getAllYetCommissionedSuccessfulJobAppsByRecruiterId(
              recruiterId,
              accessToken
            );
          console.log(yetCommissionedSuccessfulJobApps);
          setYetCommissionedSuccessfulJobApps(
            yetCommissionedSuccessfulJobApps?.data
          );
        } catch (error) {
          console.log(error);
        }
      };
      fetchYetCommissionedSuccessfulJobApps();
    }
    setIsLoading(false);
  }, [refreshData, accessToken]);

  const renderAdminHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">
          Successful Matched Job Applications handled by {recruiterUserName}
        </h2>
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
    return renderAdminHeader();
  };

  return (
    <>
      <DataTable
        value={yetCommissionedSuccessfulJobApps}
        selectionMode={"checkbox"}
        selection={selectedJobApps}
        onSelectionChange={(e) => setSelectedJobApps(e.value)}
        dataKey="jobApplicationId"
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="No commissions to be handled for this recruiter"
        paginator
        ref={dt}
        header={header}
        rows={10}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        rowsPerPageOptions={[10, 25, 50]}
        filters={filters}
        filterDisplay="menu"
        globalFilterFields={["jobApplicationId", "jobListing.title"]}
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        <Column field="jobApplicationId" header="jobApplicationId"></Column>
        <Column field="jobListing.jobListingId" header="JobListingId"></Column>
        <Column field="jobListing.title" header="JobListing Title"></Column>
        <Column
          field="submissionDate"
          header="Job Application Submitted On"
          sortable
          body={(rowData) => moment(rowData.submissionDate).format("YYYY/MM/DD")}
        ></Column>
        <Column
          field="jobListing.averageSalary"
          header="Listed Salary"
          sortable
          body={(rowData) => `$${rowData.jobListing.averageSalary}`}
        ></Column>
        <Column
          field="jobListing.averageSalary"
          header={`Commission (${commissionRate}% of Listed Salary)`}
          sortable
          body={(rowData) =>
            `$${
              (Number(commissionRate) / 100) * rowData.jobListing.averageSalary
            }`
          }
        ></Column>
      </DataTable>
    </>
  );
};

export default ViewSuccessfulJobAppsPage;
