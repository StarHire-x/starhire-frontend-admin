"use client";
import styles from "./viewSuccessfulJobListings.module.css";

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
import { Badge } from "primereact/badge";

export default function ViewSuccessfulJobListings() {
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
  const [jobListings, setJobListings] = useState([]);
  const [corporate, setCorporate] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
  const [totalCommission, setTotalCommission] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
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
          const allJobListings = corporate.data.jobListings;
          allJobListings?.map((jobListing) => {
            let updatedJobListing = jobListing;
            updatedJobListing.pendingInvoicesLength = updatedJobListing?.jobApplications.filter((jobApp) => jobApp.jobApplicationStatus === "Offer_Accepted" && !jobApp.invoice).length;
            return updatedJobListing;
          });
          const sortedJobListingsByPendingInvoicesLength = allJobListings?.sort((x,y) => y?.pendingInvoicesLength - x?.pendingInvoicesLength);
          setJobListings(sortedJobListingsByPendingInvoicesLength);
        } catch (error) {
          console.log("There was a problem fetching the corporate user", error);
        }
      };
      fetchOneCorporate();
    }
    setIsLoading(false);
  }, [refreshData, accessToken]);

  // useEffect(() => {
  //   console.log("SEEHERE!");
  //   console.log(selectedRows);
  // });

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

  const handleOnBackClick = () => {
    router.back();
  };

  const handleCreateClick = async () => {
    let jobApplicationIdsArray = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const jobApplication = selectedRows[i];
      jobApplicationIdsArray.push(jobApplication.jobApplicationId);
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 14);

    const request = {
      invoiceDate: startDate,
      dueDate: endDate,
      billingAddress: corporate.companyAddress,
      totalAmount: totalCommission,
      invoiceStatus: "Not_Paid",
      administratorId: currentUserId,
      corporateId: corporate.userId,
      jobApplicationIds: jobApplicationIdsArray,
    };

    if (selectedRows.length === 0) {
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
      const response = await createInvoice(request, accessToken);
      console.log("Invoice has been created successfully!" + response);
      setRefreshData((prev) => !prev);
      setSelectedRows([]);
      setUserDialog(false);
      setTotalCommission(0);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice created and sent to Corporate successfully!",
        life: 5000,
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error creating invoice!",
        life: 5000,
      });
    }
  };

  //Dialog codes
  const showUserDialog = () => {
    setUserDialog(true);
    let totalCommissionCalculated = 0;
    for (let i = 0; i < selectedRows.length; i++) {
      const jobApplication = selectedRows[i];
      totalCommissionCalculated =
        totalCommissionCalculated + jobApplication.jobListing.averageSalary;
    }
    setTotalCommission(totalCommissionCalculated);
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const userDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={handleCreateClick} />
    </React.Fragment>
  );

  //Row Expansion codes
  const allowExpansion = (rowData) => {
    return rowData.jobApplications.length >= 0;
  };

  const rowExpansionTemplate = (data) => {
    const { jobApplications, averageSalary } = data;
    return (
      <div className="p-3">
        <DataTable
          header={rowExpansionHeader}
          value={jobApplications}
          emptyMessage="No job applications found."
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
            field="averageSalary"
            header="Commission"
            sortable
            body={`$${averageSalary}`}
          ></Column>
        </DataTable>
      </div>
    );
  };

  const jobListingIdBodyTemplate = (rowData) => {
    const jobListingId = rowData.jobListingId;
    const pendingNumOfSuccessfulJobAppsToInvoice = rowData?.pendingInvoicesLength;
    return (
      <div>
      {jobListingId} 
      <Badge style={{marginLeft: '15%'}} value={`${pendingNumOfSuccessfulJobAppsToInvoice} Job App(s) Pending`} severity="danger"></Badge>
      </div>
    )
  }

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
          <div>
            <DataTable
              value={jobListings}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={(data) =>
                rowExpansionTemplate({
                  jobApplications: data.jobApplications.filter(
                    (jobApplication) =>
                      jobApplication.jobApplicationStatus ===
                        "Offer_Accepted" && jobApplication.invoice === null
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
                body={jobListingIdBodyTemplate}
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
                onClick={() => showUserDialog()}
              />
            </div>
            <Dialog
              visible={userDialog}
              style={{ width: "40vw", height: "50vh" }}
              breakpoints={{ "960px": "75vw", "641px": "90vw" }}
              header={"Bill Invoice to Corporate User " + corporate.userName}
              className="p-fluid"
              footer={userDialogFooter}
              onHide={hideDialog}
            >
              <div className={styles.dialogTextContainer}>
                <h5>
                  Do take note that once you select &quot;Yes&quot;, an invoice
                  will be generated for the following successful job
                  applications, and this invoice will be billed to{" "}
                  {corporate.userName}.
                </h5>
                <DataTable
                  value={selectedRows}
                  showGridlines
                  tableStyle={{ width: "35vw", marginTop: "10px" }}
                >
                  <Column
                    field="jobApplicationId"
                    header="Job Application ID"
                  ></Column>
                  <Column
                    field="recruiter.userName"
                    header="Assigned By"
                  ></Column>
                  <Column
                    field="jobListing.averageSalary"
                    header="Amount"
                    body={(rowData) => `$${rowData.jobListing.averageSalary}`}
                  ></Column>
                </DataTable>
                <div className={styles.dialogTotalAmountContainer}>
                  <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
                    Total Amount:
                  </span>
                  <span style={{ fontWeight: "bold" }}>${totalCommission}</span>
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}
