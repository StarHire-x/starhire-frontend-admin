"use client";
import styles from "./invoice.module.css";

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
import HumanIcon from "../../../public/icon.png";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Enums from "@/common/enums/enums";
import { viewAssignedJobSeekersByJobListing } from "@/app/api/jobListings/route";
import { InputText } from "primereact/inputtext";
import { getUserByUserId, getUsers } from "@/app/api/auth/user/route";

export default function InvoicePage() {
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
  const jobListingTitle = params.get("title");
  const dt = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [selectedRow, setSelectedRow] = useState([]);
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
      viewAssignedJobSeekersByJobListing(id, currentUserId, accessToken)
        .then(async (data) => {
          //can do another map here to call another api fetch to fetch all the job seeker details based on the job seeker id.
          const assignedJobSeekers = [];
          for (const x of data) {
            const jobSeeker = await getUserByUserId(
              x.jobSeekerId,
              "Job_Seeker",
              accessToken
            );
            assignedJobSeekers.push(jobSeeker.data);
          }
          setUsers(assignedJobSeekers);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching job assignment details:", error);
          setIsLoading(false);
        });
    }
  }, [id, currentUserId, accessToken]);

  // useEffect(() => {
  //   console.log("SEEHERE!");
  //   console.log(jobListingTitle);
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
        <h2 className="m-0">All Corporate Users</h2>
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

  const handleSuccessfulJobListings = (rowData) => {
    if (accessToken) {
      return;
    }
  };

  const usernameBodyTemplate = (rowData) => {
    const userName = rowData.userName;
    const avatar = rowData.profilePictureUrl;

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

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className={styles.buttonContainer}>
          <Button
            label="View More Details"
            outlined
            rounded
            size="small"
            onClick={() => handleSuccessfulJobListings(rowData)}
          />
        </div>
      </React.Fragment>
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
              value={users}
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
              emptyMessage="No corporate users found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              style={{ minWidth: "50vw" }}
            >
              <Column
                field="userName"
                header="User Name"
                sortable
                body={usernameBodyTemplate}
              ></Column>
              <Column field="email" header="Email" sortable></Column>
              <Column field="contactNo" header="Contact No" sortable></Column>
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "1rem" }}
              ></Column>
            </DataTable>
          </div>
        </div>
      )}
    </div>
  );
}
