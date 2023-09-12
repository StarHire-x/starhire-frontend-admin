"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { updateUser, getUsers, deleteUser } from "../api/auth/user/route";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AccountManagement() {
  const session = useSession();

  const router = useRouter();

  console.log(session);

  // if (session.status === "unauthenticated") {
  //   router?.push("/login");
  // }

  const [refreshData, setRefreshData] = useState(false);
  const [user, setUser] = useState(null);
  const [userDialog, setUserDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
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
  const dt = useRef(null);

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

  const showDeleteDialog = (rowData) => {
    setDeleteDialog(true);
  }


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
            showUserDialog(rowData);
          }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          className="mr-2"
          onClick={() => {
            setSelectedRowData(rowData);
            //console.log("Selected Row Data:", selectedRowData);
            showDeleteDialog(rowData);
          }}
        />
      </React.Fragment>
    );
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  }

  const saveStatusChange = async () => {
    console.log(selectedRowData);
    try {
      const toggledStatus =
        selectedRowData.status === "Active" ? "Inactive" : "Active";
      const request = {
        role: selectedRowData.role,
        status: toggledStatus,
      };
      console.log(request);
      const response = await updateUser(request, selectedRowData.userId);
      console.log("Status changed successfully:", response);
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Error changing status:", error);
    }
    setSelectedRowData();
    setUserDialog(false);
  };

  const deleteUserFromRow = async () => {
    console.log(selectedRowData);
    try {
      const request = {
        role: selectedRowData.role,
      }
      console.log(request);
      const response = await deleteUser(selectedRowData.role, selectedRowData.userId);
      console.log("User is deleted", response)
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setSelectedRowData();
    setDeleteDialog(false);
  }

  const userDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={saveStatusChange} />
    </React.Fragment>
  );

  const deleteUserDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteDialog}
      />
      <Button label="Yes" icon="pi pi-check" onClick={deleteUserFromRow} />
    </React.Fragment>
  );

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const renderHeader = () => {
    return (
      <div className="flex gap-2 justify-content-between align-items-center">
        <h4 className="m-0">Users</h4>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
        <Button
          label="Export CSV"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={exportCSV}
        />
      </div>
    );
  };

  useEffect(() => {
    getUsers()
      .then((user) => setUser(user.data))
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, [refreshData]);

  const header = renderHeader();

  // if (
  //   session.status === "authenticated" &&
  //   session.data.user.role !== "Administrator"
  // ) {
  //   router?.push("/dashboard");
  // }

  if (
    // session.status === "authenticated" && session.data.user.role === "Administrator"
    true
  ) {
    return (
      <div className="card">
        <DataTable
          value={user}
          paginator
          ref={dt}
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
          globalFilterFields={[
            "userId",
            "userName",
            "email",
            "contactNo",
            "status",
            "role",
          ]}
          emptyMessage="No users found."
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column field="userId" header="User Id" sortable></Column>
          <Column field="userName" header="User Name" sortable></Column>
          <Column field="email" header="Email" sortable></Column>
          <Column field="contactNo" header="Contact No" sortable></Column>
          <Column
            field="status"
            header="Status"
            sortable
            body={statusBodyTemplate}
            filter
            filterElement={statusFilterTemplate}
          ></Column>
          <Column field="role" header="Role" sortable></Column>
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
          <Column field="createdAt" header="Created Date" sortable></Column>
        </DataTable>

        <Dialog
          visible={userDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Change Status"
          className="p-fluid"
          footer={userDialogFooter}
          onHide={hideDialog}
        >
          <h3>{selectedRowData && selectedRowData.userName}</h3>
        </Dialog>

        <Dialog
          visible={deleteDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Delete user"
          className="p-fluid"
          footer={deleteUserDialogFooter}
          onHide={hideDeleteDialog}
        >
          <h1>{selectedRowData && selectedRowData.userName}</h1>
        </Dialog>
      </div>
    );
  }
}
