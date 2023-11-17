"use client";
import {
  getAllCommissionsByRecruiterId,
  updateCommissionStatus,
} from "@/app/api/commission/route";
import Enums from "@/common/enums/enums";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import HumanIcon from "../../../public/icon.png";
import styles from "./page.module.css";

const ViewRecruiterCommissions = () => {
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

  if (
    session.status === "authenticated" &&
    currentUserRole !== Enums.RECRUITER
  ) {
    router.push("/dashboard");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === "authenticated" && session.data.user.userId;

  const [isLoading, setIsLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [selectedConfirmPaymentId, setSelectedConfirmPaymentId] =
    useState(null);

  const loadCommissionsByRecruiterId = async (accessToken) => {
    setIsLoading(true);
    const allCommissions = await getAllCommissionsByRecruiterId(
      currentUserId,
      accessToken
    );
    setCommissions([...allCommissions]);
    setIsLoading(false);
  };

  const confirmPaymentMade = async (commissionId) => {
    try {
      const request = {
        commissionStatus: "Confirmed_Paid",
      };
      await updateCommissionStatus(request, commissionId, accessToken);
      await loadCommissionsByRecruiterId(accessToken);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Payment has been confirmed!",
        life: 5000,
      });
    } catch (error) {
      console.log(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error handling process. Please try again.",
        life: 5000,
      });
    }
  };

  const downloadInvoice = async (rowData) => {
    // window.location.assign(rowData?.paymentDocumentURL);
    window.open(rowData?.paymentDocumentURL, "_blank");
  };

  useEffect(() => {
    if (accessToken) {
      try {
        loadCommissionsByRecruiterId(accessToken);
      } catch (error) {
        console.log(error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error loading commissions. Please refresh the page.",
          life: 5000,
        });
      }
    }
  }, [accessToken]);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    commissionId: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
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

  const renderHeader = () => {
    return (
      <div className={styles.tableHeader}>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search By ID"
          />
        </span>
      </div>
    );
  };

  const paidBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.commissionStatus?.replace("_", " ")}
        severity={getSeverity(rowData.commissionStatus)}
      />
    );
  };

  const adminDetailBodyTemplate = (rowData) => {
    const userName = rowData.administrator?.userName;
    const avatar = rowData.administrator?.profilePictureUrl;
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

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className={styles.actionButtons}>
        <Button
          icon="pi pi-align-justify"
          rounded
          outlined
          severity="info"
          aria-label="Details"
          onClick={() => setSelectedCommission(rowData)}
          tooltip="Show Job Application Details"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-download"
          rounded
          outlined
          severity="warning"
          aria-label="ViewInvoice"
          onClick={() => downloadInvoice(rowData)}
          tooltip="Download Statement"
          tooltipOptions={{ position: "top" }}
        />
        {rowData?.commissionStatus === "Indicated_Paid" && (
          <Button
            label="Confirm Payment"
            severity="success"
            size="small"
            onClick={() => setSelectedConfirmPaymentId(rowData?.commissionId)}
            tooltip="Confirm payment has been made"
            tooltipOptions={{ position: "top" }}
            style={{ height: "30px" }}
          />
        )}
      </div>
    );
  };

  const ConfirmPaymentDialog = (
    <ConfirmDialog
      visible={selectedConfirmPaymentId != null}
      onHide={() => setSelectedConfirmPaymentId(null)}
      message="Have you checked payment has been made?"
      header="Confirm Payment Made"
      icon="pi pi-exclamation-triangle"
      accept={() => confirmPaymentMade(selectedConfirmPaymentId)}
      reject={() => setSelectedConfirmPaymentId(null)}
    />
  );

  const SelectedCommissionDialog = () => {
    const bodyJobListingId = (jobApplication) => {
      return jobApplication?.jobListing?.jobListingId;
    };

    const bodyJobListingTitle = (jobApplication) => {
      return jobApplication?.jobListing?.title;
    };

    const jobSeekerBodyTemplate = (jobApplication) => {
      const userName = jobApplication.jobSeeker?.userName;
      const avatar = jobApplication.jobSeeker?.profilePictureUrl;
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

    const bodySalary = (jobApplication) => {
      return `$${jobApplication?.jobListing?.averageSalary?.toFixed(2)}`;
    };

    return (
      <Dialog
        header={`#${
          selectedCommission ? selectedCommission.commissionId : ""
        } Commission`}
        visible={selectedCommission != null}
        style={{ width: "60vw" }}
        onHide={() => setSelectedCommission(null)}
      >
        <DataTable
          value={selectedCommission?.jobApplications}
          scrollable
          scrollHeight="45vh"
          emptyMessage="No job applications found."
          header="Job Applications"
        >
          <Column field="jobApplicationId" header="ID" sortable rowSpan />
          <Column
            field="jobListingId"
            header="Job Listing ID"
            sortable
            body={bodyJobListingId}
          />
          <Column
            field="jobListingId"
            header="Title"
            sortable
            body={bodyJobListingTitle}
          />
          <Column
            field="jobSeekerDetail"
            header="Applicant"
            sortable
            body={jobSeekerBodyTemplate}
          />
          <Column field="salary" header="Salary" sortable body={bodySalary} />
        </DataTable>
      </Dialog>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      {ConfirmPaymentDialog}
      {SelectedCommissionDialog()}
      {selectedCommission && <Dialog />}
      {isLoading ? (
        <ProgressSpinner className={styles.progressSpinner} />
      ) : (
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Commissions</h2>
          </div>
          <Card className={styles.dataTable}>
            <DataTable
              value={commissions}
              paginator
              header={renderHeader}
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="commissionId"
              filters={filters}
              globalFilterFields={["commissionId"]}
              emptyMessage="No commissions found."
              scrollable
              scrollHeight="45vh"
            >
              <Column field="commissionId" header="ID" sortable rowSpan />
              <Column
                field="commissionDate"
                header="Generated On"
                sortable
                body={(rowData) =>
                  moment(rowData?.commissionDate).format("YYYY/MM/DD")
                }
              />
              <Column
                field="recruiter"
                header="Created By"
                sortable
                body={adminDetailBodyTemplate}
              />
              <Column
                field="commissionAmount"
                header="Commission"
                sortable
                body={(rowData) => `$${rowData?.commissionAmount?.toFixed(2)}`}
              />
              <Column
                field="commissionStatus"
                header="Commission Status"
                sortable
                body={paidBodyTemplate}
              />
              <Column field="commissionRate" header="Salary %" sortable />
              <Column body={actionsBodyTemplate} />
            </DataTable>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ViewRecruiterCommissions;
