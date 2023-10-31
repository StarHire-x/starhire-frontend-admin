import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./jobApplicationModal.module.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Enums from "@/common/enums/enums";
import { Tag } from "primereact/tag";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getRecrutierJobApplicationStatictics, getRecrutierJobListingMatchingStatictics } from "@/app/api/auth/user/route";
import { fetchData } from "next-auth/client/_utils";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { useRouter } from "next/navigation";
import { TabMenu } from "primereact/tabmenu";

const JobApplicationModal = ({ accessToken, userId }) => {

    const [overallStats, setOverallStats] = useState({});
    const [jobApplications, setJobApplications] = useState([]);
    const router = useRouter();

    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const onGlobalFilterChange = (e) => {
      const value = e.target.value;
      let _filters = { ...filters };

      _filters["global"].value = value;

      setFilters(_filters);
      setGlobalFilterValue(value);
    };

    const tabs = [
      { label: "All", icon: "pi pi-fw pi-user" },
      { label: "Submitted", icon: "pi pi-fw pi-thumbs-up" },
      { label: "To Be Submitted", icon: "pi pi-fw pi-info-circle" },
      {
        label: "Waiting for Interview",
        icon: "pi pi-fw pi-stop-circle",
      },
    ];

    const [currentTab, setCurrentTab] = useState(0);

    

    useEffect(() => {
      const fetchData = async () => {
        try {
          const information = await getRecrutierJobApplicationStatictics(
            accessToken,
            userId
          );

          const filteredInformation = information.formatResponse.filter(
            (item) =>
              [
                "To_Be_Submitted",
                "Submitted",
                "Waiting_For_Interview",
              ].includes(item.jobApplicationStatus)
          );

          if (currentTab === 0) {
            setJobApplications(filteredInformation);
          } else if (currentTab === 1) {
            setJobApplications(
              filteredInformation.filter(
                (application) =>
                  application.jobApplicationStatus === "Submitted"
              )
            );
          } else if (currentTab === 2) {
            setJobApplications(
              filteredInformation.filter(
                (application) =>
                  application.jobApplicationStatus === "To_Be_Submitted"
              )
            );
          } else if (currentTab === 3) {
            setJobApplications(
              filteredInformation.filter(
                (application) =>
                  application.jobApplicationStatus === "Waiting_For_Interview"
              )
            );
          }

          setOverallStats(information.statusCount);
        } catch (error) {
          console.error("An error occurred while fetching the data", error);
        }
      };

      fetchData();
    }, [accessToken, userId, currentTab]);

    const header = () => {
      return renderRecruiterHeader();
    };

    const cardHeader = () => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: "10px 10px 10px 10px" }}>
            Job Application Analytics
          </h2>
        </div>
      );
    };

  
    const renderRecruiterHeader = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 className="m-0">Job Application - Action Required</h2>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Keyword Search"
            />
          </span>
        </div>
        <TabMenu
          className={styles.tabMenu}
          model={tabs}
          onTabChange={(e) => setCurrentTab(e.index)}
          activeIndex={currentTab}
        />
      </div>
    );
    };

    const jobSeekerBodyTemplate = (rowData) => {
      const userName = rowData.jobSeekerName;
      const avatar = rowData.jobSeekerProfilePic;

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

    const corporateBodyTemplate = (rowData) => {
      const userName = rowData.corporateName;
      const avatar = rowData.corporateProfilePic;

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

    const viewDetailsBodyTemplate = (rowData) => {
      const jobApplicationId = rowData.jobApplicationId;
      return (
        <Button
          rounded
          outlined
          severity="help"
          icon="pi pi-align-justify"
          onClick={() => {
            router.push(
              `/jobApplications/viewJobApplication?id=${jobApplicationId}`
            );
          }}
        />
      );
    };

    const getStatus = (status) => {
      switch (status) {
        case Enums.SUBMITTED:
          return "success";
        case Enums.TOBESUBMITTED:
          return "danger";
        case Enums.WAITINGFORINTERVIEW:
          return "info";
      }
    };

    const statusBodyTemplate = (rowData) => {
      return (
        <Tag value={rowData.jobApplicationStatus} severity={getStatus(rowData.jobApplicationStatus)} />
      );
    };

    return (
      <div className={styles.mainContainer}>
        <Card className={styles.customCardGraph} header={cardHeader}>
          <div className={styles.layout}>
            <div className={styles.cardColumnLeft}>
              <Card className={styles.customCard}>
                <div className={styles.cardLayout}>
                  <h1>{overallStats.Total}</h1>
                  <h4>Total Application</h4>
                </div>
              </Card>
              <Card className={styles.customCard}>
                <div className={styles.cardLayout}>
                  <h1>{overallStats.Submitted}</h1>
                  <h4>Submitted</h4>
                </div>
              </Card>
              <Card className={styles.customCard}>
                <div className={styles.cardLayout}>
                  <h1>{overallStats.To_Be_Submitted}</h1>
                  <h4>To be Submitted</h4>
                </div>
              </Card>
              <Card className={styles.customCard}>
                <div className={styles.cardLayout}>
                  <h1>{overallStats.Processing}</h1>
                  <h4>Processing</h4>
                </div>
              </Card>
              <Card className={styles.customCard}>
                <div className={styles.cardLayout}>
                  <h1>{overallStats.Waiting_For_Interview}</h1>
                  <h4>Waiting for Interview</h4>
                </div>
              </Card>
            </div>
            <div
              className={styles.cardColumnRight}
            >
              <DataTable
                header={header}
                value={jobApplications}
                showGridlines
                filters={filters}
                globalFilterFields={[
                  "jobApplicationId",
                  "jobSeekerName",
                  "corporateName",
                  "jobListingTitle",
                ]}
                tableStyle={{ minWidth: "50rem" }}
                rows={4}
                paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage="No job assignments found."
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              >
                <Column
                  field="jobApplicationId"
                  header="Id"
                  style={{ textAlign: "center", verticalAlign: "middle" }}
                  sortable
                ></Column>
                <Column
                  field="jobSeekerName"
                  header="Job Seeker"
                  sortable
                  body={jobSeekerBodyTemplate}
                ></Column>
                <Column
                  field="corporateName"
                  header="Corporate"
                  sortable
                  body={corporateBodyTemplate}
                ></Column>
                <Column
                  field="jobListingTitle"
                  header="Job Listing"
                  sortable
                ></Column>
                <Column
                  field="jobApplicationStatus"
                  header="Status"
                  sortable
                  body={statusBodyTemplate}
                ></Column>
                <Column
                  exportable={false}
                  style={{ minWidth: "1rem" }}
                  header="Actions"
                  body={viewDetailsBodyTemplate}
                ></Column>
              </DataTable>
            </div>
          </div>
        </Card>
      </div>
    );
};

export default JobApplicationModal;
