import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Panel } from "primereact/panel";
import { Rating } from "primereact/rating";
import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import styles from "./JobPreferencePanel.module.css";

const JobPreferencePanel = ({
  selectedUser,
  jobPreference,
  selectedCorporateJP,
}) => {
  // Job Preference informaton Dialog Box
  const [visible, setVisible] = useState(false);

  const headerTemplate = (options) => {
    const className = `${options.className}`;
    const titleClassName = `${options.titleClassName} ml-2 text-primary`;
    const style = { fontSize: "1rem" };

    return (
      <div className={className}>
        <span className={titleClassName} style={style}>
          Job Preferences
        </span>
        {/* <Button
          style={{
            width: "30px",
            height: "30px",
          }}
          severity="info"
          onClick={() => setVisible(true)}
          icon="pi pi-info"
          outlined
        ></Button> */}
      </div>
    );
  };

  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue(
      "--text-color-secondary"
    );

    console.log(jobPreference);
    console.log(selectedCorporateJP);

    const data = {
      labels: ["Benefit", "Salary", "Work-life Balance"],
      datasets: [
        {
          label: "Job Seeker Preference",
          borderColor: documentStyle.getPropertyValue("--bluegray-600"), // darker shade
          pointBackgroundColor:
            documentStyle.getPropertyValue("--bluegray-600"),
          pointBorderColor: documentStyle.getPropertyValue("--bluegray-600"),
          pointHoverBackgroundColor: textColor,
          pointHoverBorderColor:
            documentStyle.getPropertyValue("--bluegray-600"),
          data: [
            jobPreference?.benefitPreference,
            jobPreference?.salaryPreference,
            jobPreference?.workLifeBalancePreference,
          ],
        },
        {
          label: "Corporate Preference",
          borderColor: documentStyle.getPropertyValue("--pink-600"), // darker shade
          pointBackgroundColor: documentStyle.getPropertyValue("--pink-600"),
          pointBorderColor: documentStyle.getPropertyValue("--pink-600"),
          pointHoverBackgroundColor: textColor,
          pointHoverBorderColor: documentStyle.getPropertyValue("--pink-600"),
          data: [
            selectedCorporateJP?.benefitPreference,
            selectedCorporateJP?.salaryPreference,
            selectedCorporateJP?.workLifeBalancePreference,
          ],
        },
      ],
    };
    const options = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        r: {
          min: 0, // Setting minimum value of scale
          max: 5, // Setting maximum value of scale
          grid: {
            color: textColorSecondary,
          },
          ticks: {
            stepSize: 1, // Setting each step to be of size 1
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  return (
    <Panel headerTemplate={headerTemplate}>
      <div className={styles.spanContainer}>
        <span>
          Job seeker <strong>{selectedUser.fullName}</strong> has a{" "}
          <strong>{selectedUser.similarity}%</strong> similarity with corporate
        </span>
      </div>
      <div className={styles.chartContainer}>
        <Chart
          type="radar"
          data={chartData}
          options={chartOptions}
          className="w-30rem h-30rem"
        />
      </div>

      {/* Original Code, dont delete first  */}
      {/* <div className={styles.dialogueContainer}>
        <Dialog
          header="What are job preferences?"
          visible={visible}
          style={{ width: "80vw" }}
          onHide={() => setVisible(false)}
        >
          <p className={styles.dialogueText}>
            These preferences serve as indicators of your prioritization
            criteria when evaluating potential job opportunities.
            <br />
            <br />
            You will be matched to suitable opportunities based on the
            preferences that you have provided
            <br />
            <br />
            Locations:
            <br />5 star: {"<"} 1km of mrt/bus
            <br />4 star: {"<"} 2km of mrt/bus
            <br />3 star: {"<"} 3km of mrt/bus
            <br />2 star: {"<"} 5km of mrt/bus
            <br />1 star: {"<"} 10km of mrt/bus
            <br />
            <br />
            Salary:
            <br />5 star: {">"}$10,000
            <br />4 star: {">"}$5,000
            <br />3 star: {">"}$3,500
            <br />2 star: {">"}$2,500
            <br />1 star: {">"}$1,500
            <br />
            <br />
            Work Life Balance:
            <br />5 star: {">"}50 hrs / week
            <br />4 star: {">"}40 hrs / week
            <br />3 star: {">"}30 hrs / week
            <br />2 star: {">"}20 hrs / week
            <br />1 star: {">"}10 hrs / week
            <br />
          </p>
        </Dialog>
      </div>
      <div className={styles.inputFields}>
        <div className={styles.fieldRating}>
          <label htmlFor="locationPreference" className={styles.labelRating}>
            Location:
          </label>
          <Rating
            value={Number(jobPreference?.locationPreference)}
            disabled={true}
            stars={5}
            cancel={false}
          />
        </div>

        <div className={styles.fieldRating}>
          <label htmlFor="salaryPreference" className={styles.labelRating}>
            Salary:
          </label>
          <Rating
            value={Number(jobPreference?.salaryPreference)}
            stars={5}
            disabled={true}
            cancel={false}
          />
        </div>

        <div className={styles.fieldRating}>
          <label
            htmlFor="workLifeBalancePreference"
            className={styles.labelRating}
          >
            Work Life Balance:
          </label>
          <Rating
            value={Number(jobPreference?.workLifeBalancePreference)}
            stars={5}
            disabled={true}
            cancel={false}
          />
        </div>

        <div className={styles.fieldRating}>
          <label htmlFor="culturePreference" className={styles.labelRating}>
            Culture:
          </label>
          <Rating
            value={Number(jobPreference?.culturePreference)}
            stars={5}
            disabled={true}
            cancel={false}
          />
        </div>

        <div className={styles.fieldRating}>
          <label htmlFor="diversityPreference" className={styles.labelRating}>
            Diversity:
          </label>
          <Rating
            value={Number(jobPreference?.diversityPreference)}
            stars={5}
            disabled={true}
            cancel={false}
          />
        </div>
      </div> */}
    </Panel>
  );
};

export default JobPreferencePanel;
