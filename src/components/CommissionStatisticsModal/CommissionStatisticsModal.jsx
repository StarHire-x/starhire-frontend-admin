import React, { useState, useEffect } from "react";
import styles from "./CommissionStatisticsModal.module.css";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { getARecruiterCommissionStats } from "@/app/api/commission/route";

const CommissionStatisticsModal = ({ accessToken, userId }) => {
  const [overallStats, setOverallStats] = useState({});

  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [selectedFilter, setSelectedFilter] = useState("week");
  const filterOptions = [
    { label: "Month", value: "month" },
    { label: "Week", value: "week" },
    { label: "Day", value: "day" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const documentStyle = getComputedStyle(document.documentElement);

      const fetchBreakdown = async () => {
        const textColor = documentStyle.getPropertyValue("--text-color");
        const textColorSecondary = documentStyle.getPropertyValue(
          "--text-color-secondary"
        );
        const surfaceBorder =
          documentStyle.getPropertyValue("--surface-border");

        const information = await getARecruiterCommissionStats(
          userId,
          accessToken
        );

        setOverallStats(information.overall);

        const data = {
          labels: information[selectedFilter].label,
          datasets: [
            {
              label: "Not Paid",
              backgroundColor: documentStyle.getPropertyValue("--red-500"),
              data: information[selectedFilter].dataNotPaid,
            },
            {
              label: "Indicated Paid",
              backgroundColor: documentStyle.getPropertyValue("--orange-500"),
              data: information[selectedFilter].dataIndicatedPaid,
            },
            {
              label: "Confirmed Paid",
              backgroundColor: documentStyle.getPropertyValue("--green-500"),
              data: information[selectedFilter].dataConfirmedPaid,
            },
          ],
        };

        const options = {
          maintainAspectRatio: false,
          aspectRatio: 0.6,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";

                  if (label) {
                    label += ": ";
                  }
                  if (context.parsed.y !== null) {
                    label += "$" + context.parsed.y.toLocaleString();
                  }
                  return label;
                },
              },
            },
            legend: {
              labels: {
                color: textColor,
              },
            },
          },
          scales: {
            x: {
              stacked: true, // Enable stacking for the x-axis
              title: {
                display: true,
                text: "Time Period", // actual x-axis label
                color: textColorSecondary,
              },
              ticks: {
                color: textColorSecondary,
              },
              grid: {
                color: surfaceBorder,
              },
            },
            y: {
              stacked: true, // Enable stacking for the y-axis
              title: {
                display: true,
                text: "Commission Amount ($)", // actual y-axis label
                color: textColorSecondary,
                position: "left",
              },
              ticks: {
                stepSize: 1,
                color: textColorSecondary,
              },
              grid: {
                color: surfaceBorder,
              },
              beginAtZero: true,
              min: 0,
            },
          },
        };

        setChartData(data);
        setChartOptions(options);
      };
      fetchBreakdown();
    };

    fetchData();
  }, [accessToken, userId, selectedFilter]);

  const cardHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div></div>
        <div></div>
        <h2 className={styles.cardHeader}>Commission Analytics</h2>
        <Dropdown
          style={{ margin: "10px 10px 10px 10px" }}
          value={selectedFilter}
          options={filterOptions}
          onChange={(e) => setSelectedFilter(e.value)}
          placeholder="Select timespan"
        />
      </div>
    );
  };

  return (
    <div className={styles.mainContainer}>
      <Card className={styles.customCardGraph} header={cardHeader}>
        <div className={styles.layout}>
          <div className={styles.cardColumnLeft}>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1 style={{ color: "red" }}>${overallStats.notPaidSum}</h1>
                <br />
                <p style={{ color: "red" }}>
                  {overallStats.notPaidCount} Not Paid
                </p>
              </div>
            </Card>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1 style={{ color: "orange" }}>
                  ${overallStats.indicatedPaidSum}
                </h1>
                <br />
                <p style={{ color: "orange" }}>
                  {overallStats.indicatedPaidCount} Indicated Paid
                </p>
              </div>
            </Card>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1 style={{ color: "green" }}>
                  ${overallStats.confirmedPaidSum}
                </h1>
                <br />
                <p style={{ color: "green" }}>
                  {overallStats.confirmedPaidCount} Confirmed Paid
                </p>
              </div>
            </Card>
          </div>
          <div className={styles.cardColumnRight}>
            <Chart type="bar" data={chartData} options={chartOptions} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommissionStatisticsModal;
