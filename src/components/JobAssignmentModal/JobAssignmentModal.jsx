import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./jobAssignmentModal.module.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Enums from "@/common/enums/enums";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getRecrutierJobListingMatchingStatictics } from "@/app/api/auth/user/route";
import { fetchData } from "next-auth/client/_utils";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { useRouter } from "next/navigation";
import {
  createNewChatByRecruiter,
  getAllUserChats,
} from "@/app/api/chat/route";

const JobAssignmentModal = ({ accessToken, userId}) => {

  const [overallStats, setOverallStats] = useState({});

  const [assignments, setAssignments] = useState([]);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const router = useRouter();
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

  useEffect(() => {
    const fetchData = async () => {
      const information = await getRecrutierJobListingMatchingStatictics(
        accessToken,
        userId
      );
      setOverallStats(information.stats);
      setAssignments(information.response);
    };

    fetchData();
  }, [accessToken, userId]);

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

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className={styles.buttonContainer}>
          <Button
            outlined
            rounded
            size="small"
            icon="pi pi-comments"
            onClick={() => handleChatClick(rowData)}
          />
        </div>
      </React.Fragment>
    );
  };

  const handleChatClick = async (jobSeeker) => {
    // Check if chat exists already
    if (accessToken) {
      try {
        const jobSeekerChats = await getAllUserChats(
          jobSeeker?.jobSeekerId,
          accessToken
        );
        const matchingChats = jobSeekerChats.filter(
          (chat) => chat?.recruiter?.userId === userId
        );
        console.log(jobSeekerChats, matchingChats);
        let chatId = null;
        if (matchingChats.length === 0) {
          const request = {
            recruiterId: userId,
            jobSeekerId: jobSeeker?.jobSeekerId,
            lastUpdated: new Date(),
          };
          const response = await createNewChatByRecruiter(request, accessToken);
          chatId = response?.chatId;
        } else {
          chatId = matchingChats[0]?.chatId;
        }
        router.push(`/chat?id=${chatId}`);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const header = () => {
    return renderRecruiterHeader();
  };

  const renderRecruiterHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="m-0">Pending Response from Job Seeker</h2>
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

  return (
    <div className={styles.mainContainer}>
      <Card className={styles.customCardGraph} title="Job Matching Analytics">
        <div className={styles.layout}>
          <div className={styles.cardColumnLeft}>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h2>{overallStats.matched}</h2>
                <p>Matches</p>
              </div>
            </Card>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h2>{overallStats.acceptanceRate}%</h2>
                <p>Application Rate</p>
              </div>
            </Card>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h2>{overallStats.duration}</h2>
                <p>Match to Application Time</p>
              </div>
            </Card>
          </div>
          <div className={styles.cardColumnRight}>
            <DataTable
              header={header}
              value={assignments}
              showGridlines
              filters={filters}
              globalFilterFields={[
                "jobAssignmentId",
                "jobSeekerName",
                "corporateName",
                "jobListingTitle",
              ]}
              tableStyle={{ minWidth: "55rem" }}
              rows={4}
              paginator
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              emptyMessage="No job assignments found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column
                field="jobAssignmentId"
                header="Assignment Id"
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
                body={corporateBodyTemplate}
                sortable
              ></Column>
              <Column
                field="jobListingTitle"
                header="Job Listing"
                sortable
              ></Column>
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "1rem" }}
                header="Chat"
              ></Column>
            </DataTable>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default JobAssignmentModal;
