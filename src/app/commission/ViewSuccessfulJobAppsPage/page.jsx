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
  createCommission,
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
  const [commissionDialog, setCommissionDialog] = useState(false);
  const [totalCommission, setTotalCommission] = useState(null);

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

  const [selectedJobApps, setSelectedJobApps] = useState([]);

  const params = useSearchParams();
  const recruiterId = params.get("recruiterId");
  const recruiterUserName = params.get("recruiterUserName");

  const [commissionRate, setCommissionRate] = useState({});
  const [rowClick, setRowClick] = useState(true);

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
          // console.log(yetCommissionedSuccessfulJobApps);
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

  const handleOnBackClick = () => {
    router.back();
  };

  //Dialog codes
  const showCommissionDialog = () => {
    setCommissionDialog(true);
    let totalCommissionCalculated = 0;
    selectedJobApps?.map((selectedJobApp) => {
      let updatedSelectedJobApp = selectedJobApp;
      updatedSelectedJobApp.commissionAmt =
        (commissionRate / 100) * updatedSelectedJobApp.jobListing.averageSalary;
      return updatedSelectedJobApp;
    });

    for (let i = 0; i < selectedJobApps.length; i++) {
      const jobApplication = selectedJobApps[i];
      totalCommissionCalculated =
        totalCommissionCalculated + jobApplication.commissionAmt;
    }
    setTotalCommission(totalCommissionCalculated);
  };

   const handleCreateCommission = async () => {
    let jobApplicationIdsArray = [];
    for (let i = 0; i < selectedJobApps.length; i++) {
      const jobApplication = selectedJobApps[i];
      jobApplicationIdsArray.push(jobApplication.jobApplicationId);
    }

    const commissionDate = new Date();
    

    const request = {
      commissionDate: commissionDate,
      commissionRate: commissionRate,
      commissionAmount: totalCommission,
      administratorId: currentUserId,
      recruiterId: recruiterId,
      jobApplicationIds: jobApplicationIdsArray,
    };

    if (selectedJobApps.length === 0) {
      console.error("You have not selected any successful job application.");
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please select at least a successful job application",
        life: 5000,
      });
      return;
    }

    try {
      const response = await createCommission(request, accessToken);
      console.log("Commission has been created successfully!" + response);
      setRefreshData((prev) => !prev);
      setSelectedJobApps([]);
      setCommissionDialog(false);
      setTotalCommission(0);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `Commission created and sent to Recruiter user ${recruiterUserName} successfully!`,
        life: 5000,
      });
    } catch (error) {
      console.error("Error creating commission:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error creating commission!",
        life: 5000,
      });
    }
  };

  const commissionDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={() => setCommissionDialog(false)}
      />
      <Button label="Yes" icon="pi pi-check" onClick={handleCreateCommission} />
    </React.Fragment>
  );

  return (
    <>
      <Toast ref={toast} />
      {isLoading ? (
        <ProgressSpinner
          style={{
            display: "flex",
            height: "100vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      ) : (
        <>
          <DataTable
            value={yetCommissionedSuccessfulJobApps}
            selectionMode={rowClick ? null : 'checkbox'}
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
            <Column
              field="jobListing.jobListingId"
              header="JobListingId"
            ></Column>
            <Column field="jobListing.title" header="JobListing Title"></Column>
            <Column
              field="submissionDate"
              header="Job Application Submitted On"
              sortable
              body={(rowData) =>
                moment(rowData.submissionDate).format("YYYY/MM/DD")
              }
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
                  (Number(commissionRate) / 100) *
                  rowData.jobListing.averageSalary
                }`
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
              label="Create Commission"
              rounded
              disabled={selectedJobApps?.length === 0}
              size="medium"
              onClick={() => showCommissionDialog()}
            />
          </div>

          <Dialog
            visible={commissionDialog}
            style={{ width: "40vw", height: "50vh" }}
            breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            header={"Create Commission for Recruiter User " + recruiterUserName}
            className="p-fluid"
            footer={commissionDialogFooter}
            onHide={() => setCommissionDialog(false)}
          >
            <div className={styles.dialogTextContainer}>
              <h5>
                Do take note that once you select &quot;Yes&quot;, a commission
                will be generated for the following successful job applications,
                and this commission will be sent to {recruiterUserName}.
              </h5>
              <DataTable
                value={selectedJobApps}
                showGridlines
                tableStyle={{ width: "35vw", marginTop: "10px" }}
              >
                <Column
                  field="jobApplicationId"
                  header="Job Application ID"
                ></Column>
                <Column
                  field="jobListing.jobListingId"
                  header="Job Listing ID"
                ></Column>
                <Column
                  field="jobListing.title"
                  header="Job Listing Title"
                ></Column>
                <Column
                  field="commissionAmt"
                  header="Commission"
                  body={(rowData) => `$${rowData.commissionAmt}`}
                ></Column>
              </DataTable>
              <div className={styles.dialogTotalAmountContainer}>
                <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
                  Total Commission:
                </span>
                <span style={{ fontWeight: "bold" }}>${totalCommission}</span>
              </div>
            </div>
          </Dialog>
        </>
      )}
    </>
  );
};

export default ViewSuccessfulJobAppsPage;
