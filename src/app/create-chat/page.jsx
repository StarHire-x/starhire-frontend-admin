"use client";
import React, { useState, useEffect } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { getUsersForChat } from "../api/auth/user/route";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createNewChatByRecruiter } from "../api/chat/route";
import Enums from "@/common/enums/enums";

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
        { value: Enums.JOBSEEKER, matchMode: FilterMatchMode.EQUALS },
        { value: Enums.CORPORATE, matchMode: FilterMatchMode.EQUALS },
      ],
    },
    status: {
      operator: FilterOperator.OR,
      constraints: [{ value: Enums.ACTIVE, matchMode: FilterMatchMode.EQUALS }], // only takes in Active users
    },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [statuses] = useState([Enums.ACTIVE, Enums.INACTIVE]);

  const getStatus = (status) => {
    switch (status) {
      case Enums.ACTIVE:
        return "success";
      case Enums.INACTIVE:
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
    let request = {};
    try {
      if (selectedRowData.role === Enums.JOBSEEKER) {
        request = {
          recruiterId: currentUserId, // retrieve it from session next time
          jobSeekerId: selectedRowData.userId,
          lastUpdated: new Date(),
        };
      } else if (selectedRowData.role === Enums.CORPORATE) {
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
    const chats = selectedUser.chats;
    if (chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        if (chats[i].recruiter.userId === currentUserId) {
          if (
            selectedUser.role === Enums.JOBSEEKER &&
            chats[i].jobSeeker.userId === selectedUser.userId
          ) {
            return true;
          } else if (
            selectedUser.role === Enums.CORPORATE &&
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
    return !hasChattedWithUser(rowData) ? (
      <React.Fragment>
        <Button
          icon="pi pi-comments"
          rounded
          outlined
          disabled={hasChattedWithUser(rowData)}
          className="mr-2"
          onClick={() => {
            setSelectedRowData(rowData);
            showUserDialog(rowData);
          }}
        />
      </React.Fragment>
    ) : (
      "False"
    );
  };

  const actionRoleTemplate = (rowData) => {
    return rowData.role == Enums.JOBSEEKER ? "Job Seeker" : rowData.role;
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">Users</h2>
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
    getUsersForChat(currentUserId, accessToken)
      .then((user) => {
        setUser(user);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, [refreshData, accessToken, currentUserId]);

  const header = renderHeader();

  if (
    session.status === "authenticated" &&
    session.data.user.role !== Enums.RECRUITER
  ) {
    router?.push("/dashboard");
  }

  if (
    session.status === "authenticated" &&
    session.data.user.role === Enums.RECRUITER
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
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={["userName", "email", "contactNo", "role"]}
            emptyMessage="No users found."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column field="userName" header="User Name" sortable></Column>
            <Column field="email" header="Email" sortable></Column>
            <Column field="contactNo" header="Contact No" sortable></Column>
            <Column
              field="role"
              header="Role"
              body={actionRoleTemplate}
              sortable
            ></Column>
            <Column
              field="button"
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
