import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./userStatisticsModal.module.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Enums from "@/common/enums/enums";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { getUserBreakdown, getUserStatistics } from "@/app/api/auth/user/route";

const UserStatisticsModal = ({ accessToken }) => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [overallStats, setOverallStats] = useState({});

  const [chartData1, setChartData1] = useState({});
  const [chartOptions1, setChartOptions1] = useState({});

  const [selectedFilter, setSelectedFilter] = useState("total");
  const [userPercentage, setUserPercentage] = useState({});
  const filterOptions = [
    { label: "All users", value: "total" },
    { label: "Job Seeker", value: "jobSeeker" },
    { label: "Corporate", value: "corporate" },
    { label: "Recrutier", value: "recruiter" },
    { label: "Administrator", value: "administrator" },
  ];

  const [selectedFilter1, setSelectedFilter1] = useState("week");
  const filterOptions1 = [
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

        const information = await getUserStatistics(accessToken);
        setOverallStats(information.overall);

        const data = {
          labels: information[selectedFilter1].labels,
          datasets: [
            {
              label: "Job Seeker",
              borderColor: documentStyle.getPropertyValue("--blue-500"),
              tension: 0.4,
              fill: false,
              data: information[selectedFilter1].dataJobSeeker,
            },
            {
              label: "Corporate",
              borderColor: documentStyle.getPropertyValue("--orange-500"),
              tension: 0.4,
              fill: false,
              data: information[selectedFilter1].dataCorporate,
            },
            {
              label: "Recruiter",
              backgroundColor: documentStyle.getPropertyValue("--pink-500"),
              tension: 0.4,
              fill: false,
              data: information[selectedFilter1].dataRecruiter,
            },
            {
              label: "Administrator",
              backgroundColor: documentStyle.getPropertyValue("--gray-500"),
              tension: 0.4,
              fill: false,
              data: information[selectedFilter1].dataAdmin,
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
              ticks: {
                color: textColorSecondary,
              },
              grid: {
                color: surfaceBorder,
              },
            },
            y: {
              ticks: {
                stepSize: 1,
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
      };
      fetchBreakdown();
    };

    fetchData();
  }, [accessToken, selectedFilter1]);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);

    const fetchBreakdown = async () => {
      const breakdownInfo = await getUserBreakdown(accessToken);

      const activeData = breakdownInfo.active[selectedFilter];
      const inactiveData = breakdownInfo.inactive[selectedFilter];

      const sum = inactiveData + activeData;
      const total =
        breakdownInfo.active["total"] + breakdownInfo.inactive["total"];

      const activePercentage = Number(((activeData / sum) * 100).toFixed(2));
      const inactivePercentage = Number(
        ((inactiveData / sum) * 100).toFixed(2)
      );
      const proportion = Number(((sum / total) * 100).toFixed(2));
      setUserPercentage({
        active: activePercentage,
        inactive: inactivePercentage,
        proportion: proportion,
      });
      const data = {
        labels: ["Active", "Inactive"],
        datasets: [
          {
            data: [activeData, inactiveData],
            backgroundColor: [
              documentStyle.getPropertyValue("--blue-500"),
              documentStyle.getPropertyValue("--red-500"),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue("--blue-400"),
              documentStyle.getPropertyValue("--red-400"),
            ],
          },
        ],
      };
      const options = {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
      };

      setChartData1(data);
      setChartOptions1(options);
    };

    fetchBreakdown();
  }, [accessToken, selectedFilter]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.userStatisticsContainer}>
        <Card className={styles.customCard}>
          <div className={styles.cardLayout}>
            <div className={styles.statisticsColumn}>
              <h1 className="montserrat" style={{ fontSize: "3em" }}>
                {overallStats.jobSeeker}
              </h1>
              <h2 className="montserrat">Job Seeker</h2>
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
              <h1 className="montserrat" style={{ fontSize: "3em" }}>
                {overallStats.recruiter}
              </h1>
              <h2 className="montserrat">Recruiter</h2>
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
              <h1 className="montserrat" style={{ fontSize: "3em" }}>
                {overallStats.corporate}
              </h1>
              <h2 className="montserrat">Corporate</h2>
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
              <h1 className="montserrat" style={{ fontSize: "3em" }}>
                {overallStats.administrator}
              </h1>
              <h2 className="montserrat">Administrator</h2>
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
          <div className={styles.headerGraph}>
            <h2 className="montserrat">
              Account Creation Analysis by {selectedFilter1}
            </h2>
            <Dropdown
              value={selectedFilter1}
              options={filterOptions1}
              onChange={(e) => setSelectedFilter1(e.value)}
              placeholder="Select a role"
            />
          </div>
          <Chart type="line" data={chartData} options={chartOptions} />
        </Card>
        <Card className={styles.customCardGraph}>
          <div className={styles.headerGraph}>
            <h2 className="montserrat">
              {selectedFilter.charAt(0).toUpperCase() +
                selectedFilter.slice(1).toLowerCase()}{" "}
              Status Breakdown
            </h2>
            <Dropdown
              value={selectedFilter}
              options={filterOptions}
              onChange={(e) => setSelectedFilter(e.value)}
              placeholder="Select a role"
            />
          </div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className={styles.filterContainer}>
            <Chart
              type="pie"
              data={chartData1}
              options={chartOptions1}
              className={styles.doughnutChart}
            />
            <div className={styles.filterColumn}>
              <h2 className="montserrat">
                User Ratio: {userPercentage.proportion}%
              </h2>
              <br />
              <h2 className="montserrat">
                Active users: {userPercentage.active}%
              </h2>
              <br />
              <h2 className="montserrat">
                Inactive users: {userPercentage.inactive}%
              </h2>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserStatisticsModal;
