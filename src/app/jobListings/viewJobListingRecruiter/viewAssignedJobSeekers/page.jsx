"use client";

import React, { useEffect, useState, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Image from "next/image";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import styles from "./viewAssignedJobSeekers.module.css";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useSession } from "next-auth/react";
import HumanIcon from "../../../../../public/icon.png";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Enums from "@/common/enums/enums";
import { viewAssignedJobSeekersByJobListing } from "@/app/api/jobListings/route";
import { InputText } from "primereact/inputtext";

export default function ViewAssignedJobSeekers() {
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

  const params = useSearchParams();
  const id = params.get("id");
  const dt = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [selectedRow, setSelectedRows] = useState([]);
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

  useEffect(() => {
    if (accessToken) {
      viewAssignedJobSeekersByJobListing(id, accessToken)
      .then((data) => {
        setDetails(data);
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching job assignment details:", error);
        setIsLoading(false);
      });
    }
    // console.log("SEEHERE!");
    // console.log(details);
  }, [id, accessToken])

  const renderRecruiterHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">Assign Users for Job Listing {id}</h2>
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
    return renderRecruiterHeader();
  };

  const handleOnBackClick = () => {
    router.back();
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
              value={details}
              paginator
              ref={dt}
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="id"
              selectionMode="checkbox"
              selection={selectedRow}
              onSelectionChange={(e) => setSelectedRow(e.value)}
              filters={filters}
              filterDisplay="menu"
              globalFilterFields={["userName", "email", "contactNo", "role"]}
              emptyMessage="No users found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              style={{ minWidth: "50vw" }}
            >
             
            </DataTable>

            <div className={styles.bottomButtonContainer}>
              <Button
                label="Back"
                icon="pi pi-chevron-left"
                rounded
                size="medium"
                className="p-button-warning"
                onClick={() => handleOnBackClick()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
