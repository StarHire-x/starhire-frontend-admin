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
import { changeUserStatus, getUsers } from "../api/auth/user/route";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createNewChatByRecruiter } from "../api/auth/chat/route";
import ResponseCache from "next/dist/server/response-cache";

const CreateChat = () => {
  const session = useSession();
  const router = useRouter();
  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === "authenticated" && session.data.user.userId;

  const [refreshData, setRefreshData] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [userDialog, setUserDialog] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: {
      operator: FilterOperator.OR,
      constraints: [
        { value: "Job_Seeker", matchMode: FilterMatchMode.EQUALS },
        { value: "Corporate", matchMode: FilterMatchMode.EQUALS },
      ],
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

  // ----------------------------- PRESS BUTTON TRIGGER THIS FUNCTION -----------------------------
  const createNewChat = async () => {
    console.log(selectedRowData);
    let request = {};
    try {
      if (selectedRowData.role === "Job_Seeker") {
        request = {
          recruiterId: currentUserId, // retrieve it from session next time
          jobSeekerId: selectedRowData.userId,
          lastUpdated: new Date(),
        };
      } else if (selectedRowData.role === "Corporate") {
        request = {
          recruiterId: currentUserId, // retrieve it from session next time
          corporateId: selectedRowData.userId,
          lastUpdated: new Date(),
        };
      }

      const response = await createNewChatByRecruiter(request, accessToken);
      console.log("Chat has been created successfully!" + response);
      setRefreshData((prev) => !prev);
      router?.push("/chat");
    } catch (error) {
      console.error("Error changing status:", error);
    }
    setSelectedRowData();
    setUserDialog(false);
  };
  // ----------------------------- PRESS BUTTON TRIGGER THIS FUNCTION -----------------------------

  const hasChattedWithUser = (selectedUser) => {
    console.log("chats length");
    const chats = selectedUser.chats;
    if (chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        if (chats[i].recruiter.userId === currentUserId) {
          if (
            selectedUser.role === "Job_Seeker" &&
            chats[i].jobSeeker.userId === selectedUser.userId
          ) {
            return true;
          } else if (
            selectedUser.role === "Corporate" &&
            chats[i].corporate.userId === selectedUser.userId
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const actionBodyTemplate = (rowData) => {
    console.log("Row Data:", rowData);
    return (
      <React.Fragment>
        <Button
          icon="pi pi-comments"
          rounded
          outlined
          disabled={hasChattedWithUser(rowData)}
          className="mr-2"
          onClick={() => {
            // createNewChat(rowData);
            setSelectedRowData(rowData);
            showUserDialog(rowData);
          }}
        />
      </React.Fragment>
    );
  };

  const showUserDialog = (rowData) => {
    setUserDialog(true);
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const userDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={createNewChat} />
    </React.Fragment>
  );

  const renderHeader = () => {
    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
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
    getUsers(accessToken)
      .then((user) => setUser(user.data))
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, [refreshData, accessToken]);

  const header = renderHeader();

  if (
    session.status === "authenticated" &&
    session.data.user.role !== "Recruiter"
  ) {
    router?.push("/dashboard");
  }

  if (
    session.status === "authenticated" &&
    session.data.user.role === "Recruiter"
  ) {
    return (
      <>
        <div className="card">
          <DataTable
            scrollable
            scrollHeight="60vh"
            style={{ minHeight: "95vh" }}
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
          </DataTable>

          <Dialog
            visible={userDialog}
            style={{ width: "32rem" }}
            breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            header="Create Chat"
            className="p-fluid"
            footer={userDialogFooter}
            onHide={hideDialog}
          >
            <h3>
              Do you wish to create a new chat with{" "}
              {selectedRowData && selectedRowData.userName}?{" "}
            </h3>
          </Dialog>
        </div>
      </>
    );
  }
};

export default CreateChat;
