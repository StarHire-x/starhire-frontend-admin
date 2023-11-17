"use client";
import styles from "./ViewAllCommissions.module.css";
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
import {
  createInvoice,
  deleteInvoice,
  updateInvoicePaymentStatus,
} from "@/app/api/invoice/route";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import {
  deleteCommission,
  getAllCommissionsByRecruiterIdAndAdminId,
} from "@/app/api/commission/route";

const ViewAllCommissions = () => {
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
  const [commissions, setCommissions] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteCommissionDialog, setDeleteCommissionDialog] = useState(false);
  const [commissionDetailDialog, setCommissionDetailDialog] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState([]);

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
  const recruiterId = params.get("recruiterId");
  const recruiterUserName = params.get("recruiterUserName");

  useEffect(() => {
    if (accessToken) {
      const fetchCommissionsByRecruiterAndAdmin = async () => {
        try {
          const response = await getAllCommissionsByRecruiterIdAndAdminId(
            recruiterId,
            currentUserId,
            accessToken
          );
          setCommissions(response.data);
        } catch (error) {
          console.log("There was a problem fetching the commissions", error);
        }
      };
      fetchCommissionsByRecruiterAndAdmin();
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
        <h2 className="m-0">All Commissions of {recruiterUserName}</h2>
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

  const getSeverity = (commissionStatus) => {
    if (commissionStatus === "Not_Paid") {
      return "danger";
    } else if (commissionStatus === "Indicated_Paid") {
      return "warning";
    } else if (commissionStatus === "Confirmed_Paid") {
      return "success";
    }
  };

  const paidBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.commissionStatus.replace("_", " ")}
        severity={getSeverity(rowData.commissionStatus)}
        style={{ fontSize: "0.8em" }}
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className={styles.buttonContainer}>
          <Button
            className="p-button-info"
            style={{ marginRight: "10px" }}
            label="View Details"
            rounded
            size="small"
            onClick={() => {
              showCommissionDetailDialog(rowData);
              //   setSelectedRow(rowData);
            }}
          />
          {/* {rowData.commissionStatus === "Indicated_Paid" && (
            <Button
              className="p-button-danger"
              label="Delete Commission"
              rounded
              size="small"
              onClick={() => {
                showDeleteCommissionDialog();
                setSelectedCommission(rowData);
              }}
            />
          )} */}
        </div>
      </React.Fragment>
    );
  };

  const showDeleteCommissionDialog = (rowData) => {
    setDeleteCommissionDialog(true);
  };

  const hideDeleteCommissionDialog = () => {
    setDeleteCommissionDialog(false);
  };

  const showCommissionDetailDialog = (rowData) => {
    setCommissionDetailDialog(true);
    const commissionRate = rowData.commissionRate;
    rowData?.jobApplications?.map((selectedJobApp) => {
      let updatedSelectedJobApp = selectedJobApp;
      updatedSelectedJobApp.commissionRate = commissionRate;
      updatedSelectedJobApp.commissionAmt =
        (commissionRate / 100) * updatedSelectedJobApp.jobListing.averageSalary;
      return updatedSelectedJobApp;
    });
    setSelectedCommission(rowData);
  };

  const hideCommissionDetailDialog = (rowData) => {
    setCommissionDetailDialog(false);
  };

  const handleDeleteCommission = async () => {
    const commissionId = selectedCommission.commissionId;
    try {
      const response = await deleteCommission(commissionId, accessToken);
      setRefreshData((prev) => !prev);
      setSelectedCommission([]);
      setDeleteCommissionDialog(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `Commission ID ${commissionId} deleted successfully`,
        life: 5000,
      });
    } catch (error) {
      console.log(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Error deleting Commission ID ${commissionId}`,
        life: 5000,
      });
    }
  };

  const deleteCommissionDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteCommissionDialog}
      />
      <Button label="Yes" icon="pi pi-check" onClick={handleDeleteCommission} />
    </React.Fragment>
  );

  return (
    <div>
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
        <div className={styles.contentContainer}>
          <div>
            <DataTable
              value={commissions}
              paginator
              ref={dt}
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="commissionId"
              filters={filters}
              filterDisplay="menu"
              globalFilterFields={[
                "commissionId",
                "commissionDate",
                "commissionAmount",
              ]}
              emptyMessage="No commissions found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              style={{ minWidth: "50vw" }}
            >
              <Column
                field="commissionId"
                header="Commission ID"
                sortable
              ></Column>
              <Column
                field="commissionDate"
                header="Generated On"
                sortable
                body={(rowData) =>
                  moment(rowData.commissionDate).format("YYYY/MM/DD")
                }
              ></Column>
              <Column
                field="commissionAmount"
                header="Commission"
                sortable
                body={(rowData) => `$${rowData.commissionAmount}`}
              ></Column>
              <Column
                field="commissionStatus"
                header="Commission Status"
                sortable
                body={paidBodyTemplate}
              ></Column>
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "1rem" }}
              ></Column>
            </DataTable>
            <Dialog
              visible={deleteCommissionDialog}
              style={{ width: "20vw" }}
              breakpoints={{ "960px": "75vw", "641px": "90vw" }}
              header={"Delete Commission " + selectedCommission.commissionId}
              className="p-fluid"
              footer={deleteCommissionDialogFooter}
              onHide={hideDeleteCommissionDialog}
            >
              <h5 style={{ color: "red" }}>
                Do take note that the deletion of a commission is irreversible.
              </h5>
            </Dialog>
            <Dialog
              visible={commissionDetailDialog}
              // style={{ width: "50vw", height: "90vh" }}
              breakpoints={{ "960px": "75vw", "641px": "90vw" }}
              header={
                "Details for Commission " + selectedCommission.commissionId
              }
              className="p-fluid"
              onHide={hideCommissionDetailDialog}
            >
              <div className={styles.dialogTextContainer}>
                <a href={selectedCommission.paymentDocumentURL} target="_blank">View your uploaded Proof of Payment for this Commission {selectedCommission.commissionId}</a>
                <DataTable
                  value={selectedCommission.jobApplications}
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
                    field="jobListing.averageSalary"
                    header="Listed Salary"
                    body={(rowData) => `$${rowData.jobListing.averageSalary}`}
                  ></Column>
                  <Column
                    field="commissionRate"
                    header="Commission Rate"
                    body={(rowData) => `${rowData.commissionRate}%`}
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
                  <span style={{ fontWeight: "bold" }}>
                    ${selectedCommission.commissionAmount}
                  </span>
                </div>
              </div>
            </Dialog>

            <div className={styles.bottomButtonContainer}>
              <Button
                label="Back"
                icon="pi pi-chevron-left"
                rounded
                size="medium"
                className="p-button-info"
                onClick={() => handleOnBackClick()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllCommissions;
