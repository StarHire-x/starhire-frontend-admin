import styles from "./ViewRecruitersTable.module.css";

import React, { useEffect, useState, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Image from "next/image";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import HumanIcon from "../../../../../public/icon.png";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Enums from "@/common/enums/enums";
import { InputText } from "primereact/inputtext";
import { getAllRecruiters } from "@/app/api/auth/user/route";

const ViewRecruitersTable = ({ router, accessToken }) => {
  const dt = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
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
      const fetchAllRecruiters = async () => {
        try {
          const allCorporates = await getAllRecruiters(accessToken);
          setUsers(allCorporates.data);
        } catch (error) {
          console.log(
            "There was a problem fetching the corporate users",
            error
          );
        }
      };
      fetchAllRecruiters();
    }
    setIsLoading(false);
  }, [accessToken]);

  const renderAdminHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">All Recruiter Users</h2>
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

  const handleCreateCommission = (rowData) => {
    router.push(
      `/commission/ViewSuccessfulJobAppsPage?recruiterId=${rowData.userId}&recruiterUserName=${rowData.userName}`
    );
  };

  const handleViewAllInvoices = (rowData) => {
    router.push(`/invoice/viewAllInvoices?corporateId=${rowData.userId}`);
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
            className={styles.billingButton}
            label="Create Commission"
            rounded
            size="small"
            onClick={() => handleCreateCommission(rowData)}
          />
          <Button
            className="p-button-warning"
            label="View All Commissions"
            rounded
            size="small"
            onClick={() => handleViewAllInvoices(rowData)}
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
              dataKey="userId"
              selectionMode="checkbox"
              selection={selectedRow}
              onSelectionChange={(e) => setSelectedRow(e.value)}
              filters={filters}
              filterDisplay="menu"
              globalFilterFields={["userName", "email", "contactNo"]}
              emptyMessage="No recruiter users found."
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
};

export default ViewRecruitersTable;
