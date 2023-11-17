import { Dropdown } from "primereact/dropdown";
import styles from "./ReviewPanel.module.css";
import { Card } from "primereact/card";
import { Panel } from "primereact/panel";
import { DataView } from "primereact/dataview";
import { useState } from "react";

const ReviewPanel = ({ reviews }) => {

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const reviewHeader = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 className={styles.headerTitle}>Reviews</h2>
    </div>
  );


  const itemTemplate = (reviews) => {
    return (
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <h4>{reviews.corporate.companyName}</h4>
          </div>
          <div className={styles.cardHeaderRight}>
            <h4>{formatDate(reviews.startDate)}</h4>
            <h4 className={styles.hideOnMobile}>-</h4>
            <h4>
              {formatDate(reviews.endDate) === "01/01/1970"
                ? "Present"
                : formatDate(reviews.endDate)}
            </h4>
          </div>
        </div>
        <div className={styles.cardDescription}>
          <p>{reviews.description}</p>
        </div>
        <div className={styles.cardFooter}></div>
      </Card>
    );
  };

  return (
    <Panel header="Reviews">
      <div className={styles.container}>
        <DataView
          value={(reviews)}
          className={styles.dataViewContainer}
          layout="grid"
          rows={3}
          header={reviewHeader}
          itemTemplate={itemTemplate}
        ></DataView>
      </div>
    </Panel>
  );
};

export default ReviewPanel;
