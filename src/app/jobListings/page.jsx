"use client"

"use client";
import React, { useState, useEffect } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Slider } from "primereact/slider";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function JobListings() {

  const session = useSession();

  const router = useRouter();

  console.log(session);

  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const [refreshData, setRefreshData] = useState(false);
  //const [user, setUser] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [userDialog, setUserDialog] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

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
  const [statuses] = useState(["Active", "Inactive"]);

  const getStatus = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
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
    return <Tag value={rowData.status} severity={getStatus(rowData.status)} />;
  };

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
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

  const actionBodyTemplate = (rowData) => {
    console.log("Row Data:", rowData);
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => {
            setSelectedRowData(rowData);
            //console.log("Selected Row Data:", selectedRowData);
            showUserDialog(rowData.title);
          }}
        />
      </React.Fragment>
    );
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const saveStatusChange = async () => {
    try {
      router.push('/jobListings/TEST'); 
    } catch (error) {
      console.error("Error changing status:", error);
    }
    setSelectedRowData(null);
    setUserDialog(false);
  };

  const userDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={saveStatusChange} />
    </React.Fragment>
  );

  const renderHeader = () => {
    return (
      <div className="flex gap-2 justify-content-between align-items-center">
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

   // Function to format date in "day-month-year" format
   const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    fetch(`http://localhost:8080/job-listing`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setJobListings(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const header = renderHeader();

  if (
    session.status === "authenticated" &&
    session.data.user.role !== "Administrator"
  ) {
    router?.push("/dashboard");
  }

  if (
    session.status === "authenticated" &&
    session.data.user.role === "Administrator"
  ) {
    return (
      <div className="card">
        <DataTable
          value={jobListings}
          paginator
          header={header}
          rows={10}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          rowsPerPageOptions={[10, 25, 50]}
          dataKey="id"
          selectionMode="checkbox"
          filters={filters}
          filterDisplay="menu"
          globalFilterFields={[
            "jobListingId",
            "title",
            "corporate.userName",
            "jobLocation",
            "listingDate",
            "jobListingStatus",
          ]}
          emptyMessage="No users found."
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column field="jobListingId" header="Listing ID"></Column>
          <Column field="title" header="Title"></Column>
          <Column field="corporate.userName" header="Corporate Name" />
          <Column field="jobLocation" header="Job Location"></Column>
          <Column
            field="listingDate"
            header="List Date"
            body={(rowData) => formatDate(rowData.listingDate)}
          ></Column>

          <Column
            field="jobListingStatus"
            header="Job Listing Status"
            body={(rowData) => (
              <span
                style={{
                  color:
                    rowData.jobListingStatus === "Active" ? "green" : "red",
                }}
              >
                {rowData.jobListingStatus}
              </span>
            )}
          ></Column>

          <Column body={actionBodyTemplate} />
        </DataTable>

        <Dialog
          visible={userDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="View More details?"
          className="p-fluid"
          footer={userDialogFooter}
          onHide={hideDialog}
        >
        </Dialog>
      </div>
    );
  }
}



//OLD CODE
/*
import React, { useState, useEffect } from 'react';
import JobListingsDataScroller from '@/components/JobListingsDataScroller/jobListingsDataScroller';
import JobListingsTable from '@/components/JobListingsTable/jobListingsTable';
import { useRouter } from "next/router";
        

export default function JobListings() {
    //const router = useRouter();
    const [jobListings, setJobListings] = useState([]);


    useEffect(() => {
        fetch(`http://localhost:8080/job-listing`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setJobListings(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div className="card">
            <JobListingsTable jobListings={jobListings} /> 
        </div>

    );
}
*/
