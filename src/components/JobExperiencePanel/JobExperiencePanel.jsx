import { Dropdown } from "primereact/dropdown";
import styles from "./JobExperiencePanel.module.css";
import { Card } from "primereact/card";
import { Panel } from "primereact/panel";
import { DataView } from "primereact/dataview";
import { useState } from "react";

const JobExperiencePanel = ({ jobExperience }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const jobExperienceHeader = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 className={styles.headerTitle}>Job Experiences</h2>
      <div>
        <Dropdown
          value={sortKey}
          options={[
            { label: "Start Date", value: "startDate" },
            { label: "Job Title", value: "jobTitle" },
          ]}
          onChange={(e) => setSortKey(e.value)}
          placeholder="Sort By"
        />
        <Dropdown
          value={sortOrder}
          options={[
            { label: "Asc", value: 1 },
            { label: "Desc", value: -1 },
          ]}
          onChange={(e) => setSortOrder(e.value)}
          placeholder="Order"
        />
      </div>
    </div>
  );

  const sortFunction = (data) => {
    if (sortKey && sortOrder) {
      return [...data].sort((a, b) => {
        const value1 = a[sortKey];
        const value2 = b[sortKey];
        if (value1 < value2) return -1 * sortOrder;
        if (value1 > value2) return 1 * sortOrder;
        return 0;
      });
    }
    return data;
  };

  const itemTemplate = (jobExperience) => {
    return (
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <h4>{jobExperience.description}</h4>
            <h4 className={styles.hideOnMobile}>|</h4>
            <h4>{jobExperience.employerName}</h4>
          </div>
          <div className={styles.cardHeaderRight}>
            <h4>{formatDate(jobExperience.startDate)}</h4>
            <h4 className={styles.hideOnMobile}>-</h4>
            <h4>
              {formatDate(jobExperience.endDate) === "01/01/1970"
                ? "Present"
                : formatDate(jobExperience.endDate)}
            </h4>
          </div>
        </div>
        <div className={styles.cardDescription}>
          <p>{jobExperience.jobDescription}</p>
        </div>
        <div className={styles.cardFooter}></div>
      </Card>
    );
  };

  return (
    <Panel header="Job Experience">
      <div className={styles.container}>
        <DataView
          value={sortFunction(jobExperience)}
          className={styles.dataViewContainer}
          layout="grid"
          rows={3}
          header={jobExperienceHeader}
          itemTemplate={itemTemplate}
        ></DataView>
      </div>
    </Panel>
  );
};

export default JobExperiencePanel;
