"use client";
import styles from "./viewAllInvoices.module.css";
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

export default function ViewAllInvoicesPage() {
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
  const [invoices, setInvoices] = useState([]);
  const [corporate, setCorporate] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  const [paymentStatusDialog, setPaymentStatusDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
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
          setInvoices(corporate.data.invoices);
        } catch (error) {
          console.log("There was a problem fetching the corporate user", error);
        }
      };
      fetchOneCorporate();
    }
    setIsLoading(false);
  }, [refreshData, accessToken]);

  useEffect(() => {
    console.log("SEEHERE!");
    console.log(selectedRow);
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
        <h2 className="m-0">All Invoices of {corporate.userName}</h2>
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

  const handleDeleteInvoice = async () => {
    try {
      const invoiceId = selectedRow.invoiceId;
      const response = await deleteInvoice(invoiceId, accessToken);
      setRefreshData((prev) => !prev);
      setSelectedRow([]);
      setUserDialog(false);
      console.log("Invoice deleted successfully", response);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice deleted successfully",
        life: 5000,
      });
    } catch (error) {
      console.log(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error deleting invoice",
        life: 5000,
      });
    }
  };

  const handlePaymentStatus = async () => {
    try {
      let status = null;
      if (selectedRow.invoiceStatus === "Indicated_Paid") {
        status = "Confirmed_Paid";
      } else {
        status = "Indicated_Paid";
      }
      const request = {
        invoiceStatus: status,
      };
      const response = await updateInvoicePaymentStatus(
        request,
        selectedRow.invoiceId,
        accessToken
      );
      setRefreshData((prev) => !prev);
      setSelectedRow([]);
      setPaymentStatusDialog(false);
      console.log("Invoice payment status updated successfully", response);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice payment status updated successfully",
        life: 5000,
      });
    } catch (error) {
      console.log(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error updating invoice payment status",
        life: 5000,
      });
    }
  };

  const getSeverity = (invoiceStatus) => {
    if (invoiceStatus === "Not_Paid") {
      return "danger";
    } else if (invoiceStatus === "Indicated_Paid") {
      return "warning";
    } else if (invoiceStatus === "Confirmed_Paid") {
      return "success";
    }
  };

  const getPaymentMethodSeverity = (paymentMethod) => {
    if (paymentMethod === "Others") {
      // using manual payment
      return "info";
    } else if (paymentMethod === "Stripe") {
      // using stripe payment
      return "warning";
    }
  };

  const paidBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.invoiceStatus.replace("_", " ")}
        severity={getSeverity(rowData.invoiceStatus)}
        style={{ fontSize: "0.8em" }}
      />
    );
  };

  const paymentMethodBodyTemplate = (rowData) => {
    const paymentMethod =
      rowData.stripePaymentLink == null || rowData.stripePaymentLink === ""
        ? "Others"
        : "Stripe";
    //this column will be showing which payment method did the corporate use.
    return (
      <>
        {rowData.invoiceStatus !== "Not_Paid" ? (
          <Tag
            value={paymentMethod}
            severity={getPaymentMethodSeverity(paymentMethod)}
            style={{
              fontSize: "0.8em",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              textAlign: "center",
              width: "100px",
            }}
          />
        ) : (
          <p style={{marginLeft: "45px"}}>-</p>
        )}
      </>
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
              showDetailDialog();
              setSelectedRow(rowData);
            }}
          />
          {rowData.invoiceStatus === "Indicated_Paid" ? (
            <Button
              className="p-button-success"
              style={{ marginRight: "10px" }}
              label="Mark as Paid"
              rounded
              size="small"
              onClick={() => {
                showPaymentStatusDialog();
                setSelectedRow(rowData);
              }}
            />
          ) : rowData.invoiceStatus === "Confirmed_Paid" ? (
            <Button
              className="p-button-warning"
              style={{ marginRight: "10px" }}
              label="Mark as Indicated Paid"
              rounded
              size="small"
              onClick={() => {
                showPaymentStatusDialog();
                setSelectedRow(rowData);
              }}
            />
          ) : null}
          {rowData.invoiceStatus === "Not_Paid" && (
            <Button
              className="p-button-danger"
              label="Delete Invoice"
              rounded
              size="small"
              onClick={() => {
                showUserDialog();
                setSelectedRow(rowData);
              }}
            />
          )}
          {rowData.invoiceStatus !== "Not_Paid" && (
            <Button
              className="p-button-help"
              label="View Proof of Payment"
              rounded
              size="small"
              onClick={() => {
                downloadProofOfPayment(rowData);
              }}
            />
          )}
        </div>
      </React.Fragment>
    );
  };

  const showUserDialog = (rowData) => {
    setUserDialog(true);
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const showPaymentStatusDialog = (rowData) => {
    setPaymentStatusDialog(true);
  };

  const hidePaymentStatusDialog = (rowData) => {
    setPaymentStatusDialog(false);
  };

  const showDetailDialog = (rowData) => {
    setDetailDialog(true);
  };

  const hideDetailDialog = (rowData) => {
    setDetailDialog(false);
  };

  const downloadProofOfPayment = (rowData) => {
    if (rowData?.proofOfPaymentLink) {
      window.open(rowData?.proofOfPaymentLink, "_blank");
    } else if (rowData.stripePaymentLink) {
      window.open(rowData.stripePaymentLink, "_blank");
    }
    return;
  };

  const userDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={handleDeleteInvoice} />
    </React.Fragment>
  );

  const paymentStatusDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hidePaymentStatusDialog}
      />
      <Button label="Yes" icon="pi pi-check" onClick={handlePaymentStatus} />
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
            "justify-content": "center",
            "align-items": "center",
          }}
        />
      ) : (
        <div className={styles.contentContainer}>
          <div>
            <DataTable
              value={invoices}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              paginator
              ref={dt}
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="invoiceId"
              filters={filters}
              filterDisplay="menu"
              globalFilterFields={[
                "invoiceId",
                "invoiceDate",
                "dueDate",
                "totalAmount",
              ]}
              emptyMessage="No invoices found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              style={{ minWidth: "50vw" }}
            >
              <Column field="invoiceId" header="Invoice ID" sortable></Column>
              <Column
                field="invoiceDate"
                header="Billed On"
                sortable
                body={(rowData) =>
                  moment(rowData.invoiceDate).format("YYYY/MM/DD")
                }
              ></Column>
              <Column
                field="dueDate"
                header="Due On"
                sortable
                body={(rowData) => moment(rowData.dueDate).format("YYYY/MM/DD")}
              ></Column>
              <Column
                field="amount"
                header="Amount"
                sortable
                body={(rowData) => `$${rowData.totalAmount}`}
              ></Column>
              <Column
                field="invoiceStatus"
                header="Payment Status"
                sortable
                body={paidBodyTemplate}
              ></Column>
              <Column
                header="Payment Method"
                sortable
                body={paymentMethodBodyTemplate}
              ></Column>
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "1rem" }}
              ></Column>
            </DataTable>
            <Dialog
              visible={userDialog}
              style={{ width: "20vw" }}
              breakpoints={{ "960px": "75vw", "641px": "90vw" }}
              header={"Delete Invoice " + selectedRow.invoiceId}
              className="p-fluid"
              footer={userDialogFooter}
              onHide={hideDialog}
            >
              <h5 style={{ color: "red" }}>
                Do take note that the deletion of an invoice is irreversible.
              </h5>
            </Dialog>
            <Dialog
              visible={paymentStatusDialog}
              style={{ width: "20vw" }}
              breakpoints={{ "960px": "75vw", "641px": "90vw" }}
              header={
                "Change payment status for Invoice " + selectedRow.invoiceId
              }
              className="p-fluid"
              footer={paymentStatusDialogFooter}
              onHide={hidePaymentStatusDialog}
            ></Dialog>

            <Dialog
              visible={detailDialog}
              style={{ width: "40vw", height: "50vh" }}
              breakpoints={{ "960px": "75vw", "641px": "90vw" }}
              header={"Details for Invoice " + selectedRow.invoiceId}
              className="p-fluid"
              onHide={hideDetailDialog}
            >
              <div className={styles.dialogTextContainer}>
                <DataTable
                  value={selectedRow.jobApplications}
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
                  <span style={{ fontWeight: "bold" }}>
                    ${selectedRow.totalAmount}
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
}
