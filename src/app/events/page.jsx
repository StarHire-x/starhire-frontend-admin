"use client";
import React, { useState, useEffect } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { viewAllPremiumUsers } from "@/app/api/subscriptions/route";
import { getAllEventListings } from "@/app/api/events/route";
import Enums from "@/common/enums/enums";
import styles from "./events.module.css";

export default function Subscriptions() {

  const session = useSession();
  const router = useRouter();

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === "authenticated" && session.data.user.userId;

  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const [events, setEvents] = useState([]);
  const [userDialog, setUserDialog] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jobListingStatus: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const getStatus = (status) => {
    switch (status) {
      case "Upcoming":
        return "success";
      case "Expired":
        return "danger";
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const showUserDialog = (rowData) => {
    setUserDialog(true);
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.eventListingStatus}
        severity={getStatus(rowData.eventListingStatus)}
      />
    );
  };

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={jobListingStatuses}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={statusItemTemplate}
        placeholder="Select One"
        className="p-column-filter"
        showClear
      />
    );
  };

  const statusItemTemplate = (option) => {
    return <Tag value={option} severity={getStatus(option)} />;
  };

  const actionAdminBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          label="View Details"
          rounded
          size="small"
          className="mr-2"
          onClick={() => {
            saveStatusChange(rowData);
          }}
        />
      </React.Fragment>
    );
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const createLink = (id, subId) => {
    const link = `/subscriptions/viewAPremiumUser?id=${id}&subId=${subId}`;
    return link;
  };

  const saveStatusChange = async (rowData) => {
    const id = rowData.userId;
    const subId = rowData.stripeSubId
    let link = createLink(id, subId);
    router.push(link);
  };

  const renderHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">All Events</h2>
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

  const formatDate = (rowData) => {
    const date = new Date(rowData.eventDate);
    return date.toLocaleDateString(); // Adjust this to your desired date format
  };
  

  const userDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={saveStatusChange} />
    </React.Fragment>
  );

  useEffect(() => {
    if (accessToken) {
      getAllEventListings(accessToken)
        .then((data) => {
            if (Array.isArray(data)) {
                setEvents(data)
            } else {
              console.error("Data is not an array:", data);
              setEvents(data.data)
            }
            setIsLoading(false);
          })
        .catch((error) => {
          console.error("Error fetching Promotion Request:", error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);

  const header = renderHeader();

  if (
    session.status === "authenticated" &&
    session.data.user.role !== Enums.ADMIN &&
    session.data.user.role !== Enums.RECRUITER
  ) {
    router?.push("/dashboard");
  }

  if (
    session.status === "authenticated" &&
    (session.data.user.role === Enums.ADMIN ||
      session.data.user.role === Enums.RECRUITER)
  ) {
    return (
      <div className={styles.card}>
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
          <>
            <DataTable
              value={events}
              paginator
              header={header}
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="id"
              selectionMode="checkbox"
              selection={selectedUsers}
              onSelectionChange={(e) => setSelectedUsers(e.value)}
              filters={filters}
              filterDisplay="menu"
              globalFilterFields={["corporate.userName"]}
              emptyMessage="There are no Event hosted on Starhire Currently."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column
                field="eventListingId"
                header="Event Listing ID"
                sortable
              ></Column>
              <Column
                field="corporate.userId"
                header="Corporate User ID"
                sortable
              ></Column>
              <Column field="eventName" header="Corporate Name" sortable />
              <Column field="location" header="Location" sortable />
              <Column field="eventDate" header="Event Date" sortable body={formatDate}></Column>
              {session.data.user.role === Enums.ADMIN ? (
                <Column
                  field="eventListingStatus"
                  header="Event Status"
                  body={statusBodyTemplate}
                  filter
                  filterElement={statusFilterTemplate}
                  sortable
                ></Column>
              ) : null}
              {session.data.user.role === Enums.ADMIN ? (
                <Column body={actionAdminBodyTemplate} />
              ) : (
                <Column body={actionRecruiterBodyTemplate} />
              )}
            </DataTable>
          </>
        )}
      </div>
    );
  }
}
