import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./userStatisticsModal.module.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Enums from "@/common/enums/enums";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { getUserStatistics } from "@/app/api/auth/user/route";

const UserStatisticsModal = ({ accessToken }) => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [overallStats, setOverallStats] = useState({});

  const [chartData1, setChartData1] = useState({});
  const [chartOptions1, setChartOptions1] = useState({});

  const [selectedFilter, setSelectedFilter] = useState("");
  const filterOptions = [
    { label: "Filter 1", value: "filter1" },
    { label: "Filter 2", value: "filter2" },
    // ... (other filter options)
  ];

  useEffect(async () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue(
      "--text-color-secondary"
    );
    const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

    const information = await getUserStatistics(accessToken);
    setOverallStats(information.overall)

    const data = {
      labels: information.labels,
      datasets: [
        {
          type: "bar",
          label: "Job Seeker",
          backgroundColor: documentStyle.getPropertyValue("--blue-500"),
          data: information.dataJobSeeker,
        },
        {
          type: "bar",
          label: "Corporate",
          backgroundColor: documentStyle.getPropertyValue("--orange-500"),
          data: information.dataCorporate,
        },
        {
          type: "bar",
          label: "Recruiter",
          backgroundColor: documentStyle.getPropertyValue("--pink-500"),
          data: information.dataRecruiter,
        },
        {
          type: "bar",
          label: "Administrator",
          backgroundColor: documentStyle.getPropertyValue("--gray-500"),
          data: information.dataAdmin,
        },
      ],
    };

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const data = {
      labels: ["A", "B", "C"],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: [
            documentStyle.getPropertyValue("--blue-500"),
            documentStyle.getPropertyValue("--yellow-500"),
            documentStyle.getPropertyValue("--green-500"),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue("--blue-400"),
            documentStyle.getPropertyValue("--yellow-400"),
            documentStyle.getPropertyValue("--green-400"),
          ],
        },
      ],
    };
    const options = {
      cutout: "60%",
    };

    setChartData1(data);
    setChartOptions1(options);
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.userStatisticsContainer}>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1>{overallStats.jobSeeker}</h1>
              <h2>Job Seeker</h2>
            </div>
            <div className={styles.statisticsColumn}>
              <i
                className="pi pi-user"
                style={{ fontSize: "5rem", alignItems: "center" }}
              ></i>
            </div>
          </div>
        </Card>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1>{overallStats.recruiter}</h1>
              <h2>Recrutier</h2>
            </div>
            <div className={styles.statisticsColumn}>
              <i
                className="pi pi-briefcase"
                style={{ fontSize: "5rem", alignItems: "center" }}
              ></i>
            </div>
          </div>
        </Card>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1>{overallStats.corporate}</h1>
              <h2>Corporate</h2>
            </div>
            <div className={styles.statisticsColumn}>
              <i
                className="pi pi-building"
                style={{ fontSize: "5rem", alignItems: "center" }}
              ></i>
            </div>
          </div>
        </Card>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1>{overallStats.administrator}</h1>
              <h2>Administrator</h2>
            </div>
            <div className={styles.statisticsColumn}>
              <i
                className="pi pi-eye"
                style={{ fontSize: "5rem", alignItems: "center" }}
              ></i>
            </div>
          </div>
        </Card>
      </div>
      <div className={styles.graphContainer}>
        <Card className={styles.customCardGraph}>
          <h2
            style={{ textAlign: "center", marginTop: "0", marginBottom: "0" }}
          >
            Account Creation Analaysis
          </h2>
          <Chart type="line" data={chartData} options={chartOptions} />
        </Card>
        <Card className={styles.customCardGraph}>
          <h2
            style={{ textAlign: "center", marginTop: "0", marginBottom: "0" }}
          >
            User Status Statistics
          </h2>
          <div className={styles.filterContainer}>
            <div className={styles.filterColumn}>
              <Dropdown
                value={selectedFilter}
                options={filterOptions}
                onChange={(e) => setSelectedFilter(e.value)}
                placeholder="Select a role"
              />
              <br />
              <br />
              <h2>User Proportion: 50%</h2>
              <br />
              <br />
              <h2>Active users: 45%</h2>
              <br />
              <br />
              <h2>Inactive users: 55%</h2>
            </div>
            <Chart
              type="doughnut"
              data={chartData1}
              options={chartOptions1}
              className={styles.doughnutChart}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserStatisticsModal;