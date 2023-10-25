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
import { createInvoice } from "@/app/api/invoice/route";
import { Toast } from "primereact/toast";

export default function ViewAllInvoicesPage() {
  const session = useSession();
  const router = useRouter();
  const toast = useRef(null);

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
  const [invoices, setInvoices] = useState([]);
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
    console.log(corporate);
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
              globalFilterFields={["jobListingId", "title"]}
              emptyMessage="No invoices found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              style={{ minWidth: "50vw" }}
            >
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
