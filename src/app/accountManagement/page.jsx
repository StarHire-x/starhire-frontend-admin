"use client"
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
import { Tag } from "primereact/tag";
import { getUsers } from "../api/auth/user/route";

export default function AccountManagement() {
  
  const [user, setUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([])
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
  const [statuses] = useState([
    "Active",
    "Inactive",
  ]);

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

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
    );
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
      </div>
    );
  };

  useEffect(() => {
    getUsers().then((user) => setUser(user.data)).catch(error => {
      console.error('Error fetching user:', error);
    });
  }, []);

  const header = renderHeader();

  return (
    <div className="card">
      <DataTable
        value={user}
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
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        <Column field="userId" header="User Id" sortable></Column>
        <Column field="userName" header="User Name" sortable></Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="contactNo" header="Contact No" sortable></Column>
        <Column
          field="status"
          header="Status"
          sortable
          body={statusBodyTemplate}
        ></Column>
        <Column field="role" header="Role" sortable></Column>
      </DataTable>
    </div>
  );
  
  
}
